// Read-only client for the public JSON API of the Seed site this blog is built from:
//   GET  /api/Resource?id=hm://<account>/<path>
//   GET  /api/Account?id=<account>
//   POST /api/QueryDocuments  (CBOR body, DocumentFilter from the Seed proto)

const readEnv = (k: string): string | undefined => {
  const v =
    (typeof process !== "undefined" ? process.env[k] : undefined) ??
    (import.meta.env as Record<string, string | undefined> | undefined)?.[k];
  return v?.trim() || undefined;
};

/** Origin of the Seed site that hosts the documents (e.g. https://horacioh.hyper.media). */
export const SEED_ORIGIN = (readEnv("PUBLIC_SEED_ORIGIN") ?? "").replace(/\/+$/, "");
/** Account (space) id that owns the documents, e.g. `z6Mk…`. */
export const SEED_ACCOUNT = readEnv("PUBLIC_SEED_ACCOUNT") ?? "";
/** Public gateway used for documents of other accounts. */
export const HM_GATEWAY = "https://hyper.media";

const cleanPath = (p: string | undefined) => (p ?? "").replace(/^\/+|\/+$/g, "");
/** Seed path prefix of the `posts` collection (no slashes). */
export const POSTS_PATH = cleanPath(readEnv("PUBLIC_SEED_POSTS_PATH") ?? "posts");
/** Seed path prefix of the `pages` collection; unset disables it, `/` means top-level docs. */
export const PAGES_PATH: string | null = (() => {
  const raw = readEnv("PUBLIC_SEED_PAGES_PATH");
  return raw === undefined ? null : cleanPath(raw);
})();

/** Throws a readable error when the Seed site isn't configured. */
export function assertSeedConfigured(): void {
  const missing = [
    !SEED_ORIGIN && "PUBLIC_SEED_ORIGIN",
    !SEED_ACCOUNT && "PUBLIC_SEED_ACCOUNT",
  ].filter(Boolean);
  if (missing.length) throw new Error(`Seed site not configured: set ${missing.join(" and ")} (see .env.example)`);
  if (!/^https?:\/\//.test(SEED_ORIGIN)) throw new Error(`PUBLIC_SEED_ORIGIN must be an http(s) URL, got "${SEED_ORIGIN}"`);
}

/** Inline annotation on a block's text (Bold, Link, inline Embed mention…). */
export interface SeedAnnotation {
  type: string;
  starts: number[];
  ends: number[];
  link?: string;
  attributes?: Record<string, unknown>;
}

/** One HM block. */
export interface SeedBlock {
  type: string;
  id: string;
  text?: string;
  link?: string;
  attributes?: Record<string, unknown>;
  annotations?: SeedAnnotation[];
}

/** HM block tree node. */
export interface SeedBlockNode {
  block: SeedBlock;
  children?: SeedBlockNode[];
}

/** Listing entry returned by QueryDocuments (no content). */
export interface SeedDocumentInfo {
  account: string;
  path: string;
  metadata: Record<string, unknown>;
  version: string;
  authors?: string[];
  createTime?: string;
  updateTime?: string;
}

/** Full document as returned by /api/Resource. */
export interface SeedDocument extends SeedDocumentInfo {
  content: SeedBlockNode[];
}

/** Parsed `hm://<uid>/<path>?v=<version>#<blockRef>` link. */
export interface HmLink {
  uid: string;
  /** Path with leading slash, "" for the account home. */
  path: string;
  version?: string;
  blockRef?: string;
}

/** Parses an hm:// URL; returns null for anything else. */
export function parseHmLink(link: string): HmLink | null {
  const m = /^hm:\/\/([A-Za-z0-9]+)((?:\/[^\s?#]*)?)(\?[^\s#]*)?(#[^\s]*)?$/.exec(link.trim());
  if (!m) return null;
  const [, uid, rawPath = "", query = "", hash = ""] = m;
  const version = new URLSearchParams(query.slice(1)).get("v") || undefined;
  const blockRef = hash.slice(1).replace(/\[.*$/, "") || undefined;
  const path = rawPath.replace(/\/+$/, "");
  return { uid, path, version, blockRef };
}

/** `hm://` id for a path in an account (defaults to the site account). */
export const hmId = (path: string, uid = SEED_ACCOUNT) => `hm://${uid}${path ? `/${cleanPath(path)}` : ""}`;

/** Public URL of a Seed document: the site origin for own docs, the gateway otherwise. */
export function seedDocUrl(path: string, uid = SEED_ACCOUNT, version?: string): string {
  const p = path ? `/${cleanPath(path)}` : "";
  const v = version ? `?v=${encodeURIComponent(version)}` : "";
  if (uid === SEED_ACCOUNT && SEED_ORIGIN) return `${SEED_ORIGIN}${p || "/"}${v}`;
  return `${HM_GATEWAY}/hm/${uid}${p}${v}`;
}

/** GET /api/<key> on a Seed origin; unwraps the `{ json }` envelope. */
export async function apiGet<T>(key: string, params: Record<string, string>, origin = SEED_ORIGIN): Promise<T> {
  const url = new URL(`${origin}/api/${key}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`Seed ${url.origin}/api/${key} responded ${res.status}`);
  const data = (await res.json()) as { json: T };
  return data.json;
}

/** Every document of the site account under `/<prefix>` ("" = whole account), sorted by path. */
export async function listDocuments(prefix: string): Promise<SeedDocumentInfo[]> {
  assertSeedConfigured();
  // Lazy import: only needed at build time.
  const { encode: cborEncode } = await import("@ipld/dag-cbor");
  const filters: unknown[] = [{ spaceMatch: { space: SEED_ACCOUNT } }];
  if (cleanPath(prefix)) filters.push({ pathMatch: { path: `/${cleanPath(prefix)}`, prefix: true } });
  const docs: SeedDocumentInfo[] = [];
  let pageToken: string | undefined;
  do {
    const body = cborEncode({
      filter: { and: { filters } },
      sort: [{ attribute: "BUILTIN_SORT_ATTRIBUTE_PATH" }],
      pageSize: 500,
      ...(pageToken ? { pageToken } : {}),
    });
    const res = await fetch(`${SEED_ORIGIN}/api/QueryDocuments`, {
      method: "POST",
      headers: { "content-type": "application/cbor" },
      body: body as unknown as BodyInit,
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`Seed /api/QueryDocuments responded ${res.status}`);
    const data = (await res.json()) as { documents?: SeedDocumentInfo[]; nextPageToken?: string };
    docs.push(...(data.documents ?? []));
    pageToken = data.nextPageToken || undefined;
  } while (pageToken);
  return docs;
}

const resourceCache = new Map<string, Promise<SeedDocument | null>>();

/** Fetches any hm:// document (own docs from the site, others via the gateway); null if unavailable. */
export function getResource(id: string): Promise<SeedDocument | null> {
  const link = parseHmLink(id);
  if (!link) return Promise.resolve(null);
  const key = `hm://${link.uid}${link.path}${link.version ? `?v=${link.version}` : ""}`;
  let hit = resourceCache.get(key);
  if (!hit) {
    const origins = [...new Set([SEED_ORIGIN, HM_GATEWAY].filter(Boolean))];
    hit = (async () => {
      for (const origin of origins) {
        try {
          const res = await apiGet<{ type: string; document?: SeedDocument }>("Resource", { id: key }, origin);
          if (res.type === "document" && res.document) return res.document;
        } catch {
          // try the next origin
        }
      }
      return null;
    })();
    resourceCache.set(key, hit);
  }
  return hit;
}

/** Full document at a path of the site account; throws if it can't be loaded. */
export async function getDocument(path: string): Promise<SeedDocument> {
  assertSeedConfigured();
  const id = hmId(path);
  const res = await apiGet<{ type: string; document?: SeedDocument }>("Resource", { id });
  if (res.type !== "document" || !res.document) throw new Error(`${id} is not a document (${res.type})`);
  return res.document;
}

const accountCache = new Map<string, Promise<string | undefined>>();

/** Display name of an account profile, if it has one. */
export function getAccountName(uid: string): Promise<string | undefined> {
  let hit = accountCache.get(uid);
  if (!hit) {
    hit = (async () => {
      for (const origin of [...new Set([SEED_ORIGIN, HM_GATEWAY].filter(Boolean))]) {
        try {
          const res = await apiGet<{ metadata?: { name?: unknown } }>("Account", { id: uid }, origin);
          const name = res.metadata?.name;
          if (typeof name === "string" && name.trim()) return name.trim();
        } catch {
          // try the next origin
        }
      }
      return undefined;
    })();
    accountCache.set(uid, hit);
  }
  return hit;
}

/** `z6Mkab…wxyz`-style short form of an account id or CID. */
export const shortId = (id: string, head = 6, tail = 4) =>
  id.length > head + tail + 1 ? `${id.slice(0, head)}…${id.slice(-tail)}` : id;

/** Normalized author: `id` is the account when known, `name` is always set. */
export interface SeedAuthor {
  id?: string;
  name: string;
}

/**
 * Authors of a document: an explicit `metadata.displayAuthor`/`metadata.authors`
 * byline wins; otherwise the signing accounts in `doc.authors`, falling back to
 * the owning account. Account ids are resolved to profile names.
 */
export async function documentAuthors(
  doc: Pick<SeedDocumentInfo, "account" | "authors" | "metadata">,
  resolveName: (uid: string) => Promise<string | undefined> = getAccountName,
): Promise<SeedAuthor[]> {
  const m = doc.metadata ?? {};
  const byline = [m.displayAuthor, m.authors]
    .flatMap((v) => (Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : []))
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
  if (byline.length) return [...new Set(byline)].map((name) => ({ name }));
  const ids = [...new Set((doc.authors?.length ? doc.authors : [doc.account]).filter(Boolean))];
  return Promise.all(ids.map(async (id) => ({ id, name: (await resolveName(id)) ?? shortId(id) })));
}

/** Site title/intro taken from the account's home document (fail-soft). */
export interface SiteInfo {
  name?: string;
  summary?: string;
}

let siteInfo: Promise<SiteInfo> | undefined;

/** Name and summary of the Seed site's home document, memoized per build. */
export function getSiteInfo(): Promise<SiteInfo> {
  siteInfo ??= (async () => {
    const doc = SEED_ORIGIN && SEED_ACCOUNT ? await getResource(hmId("")) : null;
    const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
    return { name: str(doc?.metadata.name), summary: str(doc?.metadata.summary) };
  })();
  return siteInfo;
}
