// Build-time link previews for Seed `WebEmbed` blocks: fetches the page once,
// reads its OpenGraph/Twitter/<title> tags, and caches the result on disk so
// dev rebuilds don't refetch. Never embeds the page itself.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/** Preview data for an external URL; every text field is plain (unescaped) text. */
export interface WebPreview {
  url: string;
  title?: string;
  description?: string;
  siteName?: string;
  image?: string;
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const cp = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(cp) && cp > 0 && cp <= 0x10ffff ? String.fromCodePoint(cp) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });

const clean = (s: string | undefined, max: number) => {
  const t = s && decode(s).replace(/\s+/g, " ").trim();
  if (!t) return undefined;
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

const attr = (tag: string, name: string) =>
  new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, "i").exec(tag)?.slice(1).find((v) => v !== undefined);

/** Extracts preview fields from an HTML document fetched from `url`. */
export function parseWebPreview(html: string, url: string): WebPreview {
  const meta = new Map<string, string>();
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = (attr(tag, "property") ?? attr(tag, "name"))?.toLowerCase();
    const content = attr(tag, "content");
    if (key && content !== undefined && !meta.has(key)) meta.set(key, content);
  }
  const titleTag = /<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1];
  const pick = (...keys: string[]) => keys.map((k) => meta.get(k)).find((v) => v?.trim());
  let image: string | undefined;
  const rawImage = pick("og:image:secure_url", "og:image", "og:image:url", "twitter:image", "twitter:image:src");
  if (rawImage) {
    try {
      const u = new URL(decode(rawImage.trim()), url);
      if (u.protocol === "https:" || u.protocol === "http:") image = u.toString();
    } catch {
      // ignore malformed image URLs
    }
  }
  return {
    url,
    title: clean(pick("og:title", "twitter:title") ?? titleTag, 200),
    description: clean(pick("og:description", "twitter:description", "description"), 300),
    siteName: clean(pick("og:site_name", "application-name"), 80),
    image,
  };
}

const MAX_BYTES = 512 * 1024;
const TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CACHE_FILE = process.env.WEB_PREVIEW_CACHE ?? "node_modules/.cache/horacioh.com/web-previews.json";

// Only successful previews are persisted, so a flaky site is retried next build.
type CacheFile = Record<string, { at: number; preview: WebPreview }>;
let disk: Promise<CacheFile> | undefined;
const memory = new Map<string, Promise<WebPreview | null>>();

const loadDisk = (): Promise<CacheFile> =>
  (disk ??= CACHE_FILE === "off"
    ? Promise.resolve<CacheFile>({})
    : readFile(CACHE_FILE, "utf8")
        .then((s) => JSON.parse(s) as CacheFile)
        .catch((): CacheFile => ({})));

let writes = Promise.resolve();

// Writes are chained so concurrent fetches never interleave on the file.
function saveDisk(url: string, preview: WebPreview) {
  if (CACHE_FILE === "off") return writes;
  writes = writes
    .then(async () => {
      const cache = await loadDisk();
      cache[url] = { at: Date.now(), preview };
      await mkdir(dirname(CACHE_FILE), { recursive: true });
      await writeFile(CACHE_FILE, JSON.stringify(cache));
    })
    .catch(() => {});
  return writes;
}

async function readHead(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let html = "";
  let bytes = 0;
  while (bytes < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    html += decoder.decode(value, { stream: true });
    if (/<\/head>/i.test(html)) break;
  }
  await reader.cancel().catch(() => {});
  return html;
}

async function fetchPreview(url: string): Promise<WebPreview | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; horacioh.com link preview)",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(8_000),
    });
    if (!res.ok || !/html/i.test(res.headers.get("content-type") ?? "")) {
      await res.body?.cancel().catch(() => {});
      return null;
    }
    const preview = parseWebPreview(await readHead(res), url);
    return preview.title ? preview : null;
  } catch {
    return null;
  }
}

/** Cached build-time preview of an http(s) URL; null when unreachable or not HTML. */
export function fetchWebPreview(url: string): Promise<WebPreview | null> {
  if (!/^https?:\/\//i.test(url)) return Promise.resolve(null);
  let hit = memory.get(url);
  if (!hit) {
    hit = (async () => {
      const cached = (await loadDisk())[url];
      if (cached && Date.now() - cached.at < TTL_MS) return cached.preview;
      const preview = await fetchPreview(url);
      if (preview) await saveDisk(url, preview);
      return preview;
    })();
    memory.set(url, hit);
  }
  return hit;
}
