// Maps every safe Seed document to the route matching its Seed path.
import {
  SEED_ACCOUNT,
  SEED_ORIGIN,
  documentAuthors,
  listDocuments,
  seedDocUrl,
  type SeedAuthor,
  type SeedDocument,
  type SeedDocumentInfo,
} from "./seed";

/** Routes the site itself generates; Seed docs can't take them. */
const RESERVED = new Set([
  "rss.xml",
  "404",
  "index",
  "_astro",
  "favicon.svg",
  "og.jpg",
]);

const cleanPath = (path: string | undefined) =>
  (path ?? "").replace(/^\/+|\/+$/g, "");
const seedPath = (path: string | undefined) => {
  const cleaned = cleanPath(path);
  return cleaned ? `/${cleaned}` : "";
};

/** Route id for a safe Seed document path, or null for the root and reserved paths. */
export function entryId(path: string | undefined): string | null {
  const id = cleanPath(path);
  if (!id) return null;
  const segments = id.split("/");
  if (
    segments.some((segment) => !segment || segment.includes(".")) ||
    RESERVED.has(segments[0]!)
  )
    return null;
  return id;
}

let routes: Promise<Set<string>> | undefined;

/** Site routes for every safe account document, including the home document. */
export function siteRoutes(): Promise<Set<string>> {
  routes ??= listDocuments("").then(
    (documents) =>
      new Set([
        "/",
        ...documents.flatMap((document) => {
          const id = entryId(document.path);
          return id ? [`/${id}`] : [];
        }),
      ]),
  );
  return routes;
}

const str = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;
const time = (value: unknown) => {
  const valueString = str(value);
  return valueString && !valueString.startsWith("1970-01-01")
    ? valueString
    : undefined;
};
const ipfsUrl = (value: unknown) => {
  const valueString = str(value);
  if (!valueString) return undefined;
  if (valueString.startsWith("ipfs://"))
    return `${SEED_ORIGIN}/ipfs/${valueString.slice("ipfs://".length)}`;
  return /^https?:\/\//.test(valueString) ? valueString : undefined;
};

/** Raw (pre-schema) entry data for a Seed document. */
export async function toEntryData(
  doc: SeedDocument | SeedDocumentInfo,
  resolveAuthors: (
    document: SeedDocumentInfo,
  ) => Promise<SeedAuthor[]> = documentAuthors,
) {
  const metadata = doc.metadata ?? {};
  const docPath = doc.path ?? "";
  const path = seedPath(docPath);
  const fallbackTitle = path.split("/").filter(Boolean).at(-1) ?? "Untitled";
  return {
    title: str(metadata.name) ?? str(metadata.title) ?? fallbackTitle,
    summary: str(metadata.summary),
    published: time(metadata.displayPublishTime) ?? time(doc.createTime),
    updated: time(doc.updateTime),
    version: doc.version,
    authors: await resolveAuthors(doc),
    path: path || "/",
    source: seedDocUrl(docPath),
    cover: ipfsUrl(metadata.cover),
  };
}

/** Raw (pre-schema) data for the account's root document. */
export function toHomeData(doc: SeedDocument) {
  const metadata = doc.metadata ?? {};
  return {
    name: str(metadata.name) ?? str(metadata.title) ?? "Home",
    summary: str(metadata.summary),
  };
}

/** Minimal shape needed by duplicate checks. */
export interface CheckedEntry {
  collection: string;
  id: string;
  data: { title: string; published?: Date };
}

/** Human-readable duplicate route errors. */
export function findDuplicates(entries: CheckedEntry[]): string[] {
  const errors: string[] = [];
  const byRoute = new Map<string, string>();
  for (const entry of entries) {
    const where = `${entry.collection}/${entry.id}`;
    const route = entry.id.toLowerCase();
    const previous = byRoute.get(route);
    if (previous)
      errors.push(`duplicate route /${entry.id}: ${previous} and ${where}`);
    else byRoute.set(route, where);
  }
  return errors;
}

/** Duplicate title-and-date warnings, with both Seed routes identified. */
export function findDuplicateTitles(entries: CheckedEntry[]): string[] {
  const warnings: string[] = [];
  const byTitle = new Map<string, string>();
  for (const entry of entries) {
    const date = entry.data.published;
    if (!date || Number.isNaN(date.getTime())) continue;
    const where = `${entry.collection}/${entry.id}`;
    const day = date.toISOString().slice(0, 10);
    const key = `${day}|${entry.data.title.trim().toLowerCase().replace(/\s+/g, " ")}`;
    const previous = byTitle.get(key);
    if (previous)
      warnings.push(
        `duplicate title + date "${entry.data.title}" (${day}): ${previous} and ${where}`,
      );
    else byTitle.set(key, where);
  }
  return warnings;
}

/** A Seed Query inclusion. */
export interface QueryInclude {
  space: string;
  path?: string;
  mode: "Children" | "AllDescendants";
}

/** Sort settings supported by Seed Query blocks. */
export interface QuerySort {
  term?: string;
  reverse?: boolean;
}

/** Query options stored on a Seed Query block. */
export interface QueryDefinition {
  includes?: QueryInclude[];
  sort?: QuerySort[];
  limit?: number;
}

/** Build-time query results for a Seed Query block. */
export interface QueryResult {
  documents: SeedDocumentInfo[];
  sortTerm: string;
}

const legacySortTerms: Record<string, string> = {
  CreateTime: "created",
  UpdateTime: "updated",
  DisplayTime: "displayTime",
  ActivityTime: "activity",
  Title: "title",
  Path: "path",
};

/** Resolves a Seed Query against an already-fetched account document list. */
export function resolveQuery(
  documents: SeedDocumentInfo[],
  query: QueryDefinition,
  currentPath: string,
  warn: (message: string) => void = console.warn,
): QueryResult {
  const rawSort =
    query.sort?.length === 1
      ? query.sort[0]
      : { term: "updated", reverse: true };
  const rawTerm = rawSort?.term ?? "updated";
  const legacyTerm = legacySortTerms[rawTerm];
  const sortTerm = legacyTerm ?? rawTerm;
  const reverse =
    legacyTerm &&
    ["CreateTime", "UpdateTime", "DisplayTime", "ActivityTime"].includes(
      rawTerm,
    )
      ? !(rawSort?.reverse ?? false)
      : (rawSort?.reverse ?? false);
  const current = seedPath(currentPath);
  const includes = (query.includes ?? []).filter((include) => {
    if (include.space === SEED_ACCOUNT) return true;
    warn(
      `Seed Query includes unsupported space "${include.space}"; skipping that include`,
    );
    return false;
  });
  const matches = documents.filter((document) => {
    const path = seedPath(document.path);
    if (!path || path === current || !entryId(path)) return false;
    return includes.some((include) => {
      const prefix = seedPath(include.path ?? "");
      if (!path.startsWith(`${prefix}/`)) return false;
      const relative = path.slice(prefix.length + 1);
      return include.mode === "AllDescendants" || !relative.includes("/");
    });
  });
  const value = (document: SeedDocumentInfo): string | number => {
    switch (sortTerm) {
      case "title":
        return str(document.metadata.name) ?? "";
      case "path":
        return seedPath(document.path);
      case "created":
        return Date.parse(time(document.createTime) ?? "") || 0;
      case "updated":
      case "activity":
        return Date.parse(time(document.updateTime) ?? "") || 0;
      case "displayTime":
        return (
          Date.parse(
            time(document.metadata.displayPublishTime) ??
              time(document.updateTime) ??
              "",
          ) || 0
        );
      default:
        return str(document.metadata[sortTerm.replace(/^metadata:/, "")]) ?? "";
    }
  };
  const sorted = [...matches].sort((a, b) => {
    const aValue = value(a);
    const bValue = value(b);
    if (typeof aValue === "number" && typeof bValue === "number")
      return aValue - bValue;
    return String(aValue).localeCompare(String(bValue), undefined, {
      sensitivity: "base",
      numeric: true,
    });
  });
  const ordered = reverse ? sorted.reverse() : sorted;
  const limit =
    typeof query.limit === "number" && Number.isFinite(query.limit)
      ? Math.max(0, Math.floor(query.limit))
      : undefined;
  return {
    documents: limit === undefined ? ordered : ordered.slice(0, limit),
    sortTerm,
  };
}
