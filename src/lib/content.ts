// Maps Seed documents onto the site's collections. Each entry's route is its
// Seed path, so `/<prefix>/<slug>` on Seed is `/<prefix>/<slug>` here.
import {
  PAGES_PATH,
  POSTS_PATH,
  SEED_ORIGIN,
  documentAuthors,
  listDocuments,
  seedDocUrl,
  type SeedAuthor,
  type SeedDocument,
  type SeedDocumentInfo,
} from "./seed";

/** How one collection is sourced from the Seed account. */
export interface CollectionSpec {
  name: "posts" | "pages";
  /** Seed path prefix without slashes; "" = whole account. */
  prefix: string;
  /** Prefixes owned by another collection. */
  exclude: string[];
  /** Fail the build when the collection is empty. */
  required: boolean;
}

/** Collections enabled by the current env. */
export const COLLECTIONS: CollectionSpec[] = [
  { name: "posts", prefix: POSTS_PATH, exclude: [], required: true },
  ...(PAGES_PATH === null
    ? []
    : [{ name: "pages" as const, prefix: PAGES_PATH, exclude: POSTS_PATH === PAGES_PATH ? [] : [POSTS_PATH], required: false }]),
];

/** Routes the site itself generates; Seed docs can't take them. */
const RESERVED = new Set(["rss.xml", "404", "index", "_astro"]);

const under = (path: string, prefix: string) => !prefix || path === `/${prefix}` || path.startsWith(`/${prefix}/`);

/** Entry id (= route without leading slash) for a listed doc, or null if it doesn't belong to `spec`. */
export function entryId(path: string, spec: CollectionSpec): string | null {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (p === "/" || !under(p, spec.prefix) || p === `/${spec.prefix}`) return null;
  if (spec.exclude.some((x) => x && under(p, x))) return null;
  const id = p.slice(1).replace(/\/+$/, "");
  return RESERVED.has(id.split("/")[0]) ? null : id;
}

/** Listed docs of a collection with their entry ids. */
export async function listCollection(spec: CollectionSpec): Promise<{ id: string; info: SeedDocumentInfo }[]> {
  const docs = await listDocuments(spec.prefix);
  const seen = new Set<string>();
  const out: { id: string; info: SeedDocumentInfo }[] = [];
  for (const info of docs) {
    const id = entryId(info.path, spec);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, info });
  }
  return out;
}

let routes: Promise<Set<string>> | undefined;

/** Seed paths (with leading slash) that have a page on this site; memoized per process. */
export function siteRoutes(): Promise<Set<string>> {
  routes ??= Promise.all(COLLECTIONS.map(listCollection)).then(
    (lists) => new Set(lists.flat().map(({ id }) => `/${id}`)),
  );
  return routes;
}

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
// Seed uses the Unix epoch as "no time" (e.g. on the home document).
const time = (v: unknown) => {
  const s = str(v);
  return s && !s.startsWith("1970-01-01") ? s : undefined;
};
const ipfsUrl = (v: unknown) => {
  const s = str(v);
  if (!s) return undefined;
  if (s.startsWith("ipfs://")) return `${SEED_ORIGIN}/ipfs/${s.slice("ipfs://".length)}`;
  return /^https?:\/\//.test(s) ? s : undefined;
};

/** Raw (pre-schema) entry data for a Seed document. */
export async function toEntryData(
  doc: SeedDocument | SeedDocumentInfo,
  resolveAuthors: (d: SeedDocumentInfo) => Promise<SeedAuthor[]> = documentAuthors,
) {
  const m = doc.metadata ?? {};
  return {
    title: str(m.name) ?? str(m.title) ?? "",
    summary: str(m.summary),
    published: time(m.displayPublishTime) ?? time(doc.createTime),
    updated: time(doc.updateTime),
    version: doc.version,
    authors: await resolveAuthors(doc),
    path: doc.path.startsWith("/") ? doc.path : `/${doc.path}`,
    source: seedDocUrl(doc.path),
    cover: ipfsUrl(m.cover),
  };
}

/** Minimal shape needed by {@link findDuplicates}. */
export interface CheckedEntry {
  collection: string;
  id: string;
  data: { title: string; published?: Date };
}

/** Human-readable duplicate errors: route collisions and same title + day posts. */
export function findDuplicates(entries: CheckedEntry[]): string[] {
  const errors: string[] = [];
  const byRoute = new Map<string, string>();
  const byTitle = new Map<string, string>();
  for (const e of entries) {
    const where = `${e.collection}/${e.id}`;
    const route = e.id.toLowerCase();
    const prev = byRoute.get(route);
    if (prev) errors.push(`duplicate route /${e.id}: ${prev} and ${where}`);
    else byRoute.set(route, where);
    const day = e.data.published && !Number.isNaN(e.data.published.getTime()) ? e.data.published.toISOString().slice(0, 10) : "";
    const key = `${e.collection}|${day}|${e.data.title.trim().toLowerCase().replace(/\s+/g, " ")}`;
    const prevTitle = byTitle.get(key);
    if (prevTitle) errors.push(`duplicate title + date "${e.data.title}": ${prevTitle} and ${where}`);
    else byTitle.set(key, where);
  }
  return errors;
}
