// Renders an HM (Seed) block tree to safe HTML. Every text and attribute is
// escaped and only http(s)/mailto links, Seed documents or the site's own
// routes are emitted. Embeds, mentions and web embeds are resolved at build
// time (see renderDocument) and degrade to plain links when unresolvable.
import {
  SEED_ACCOUNT,
  SEED_ORIGIN,
  documentAuthors,
  getAccountName,
  getResource,
  parseHmLink,
  seedDocUrl,
  shortId,
  type SeedAnnotation,
  type SeedBlock,
  type SeedBlockNode,
} from "./seed";
import { fetchWebPreview, type WebPreview } from "./web-preview";

/** Resolved target of an hm:// reference. */
export interface DocRef {
  kind: "document" | "account";
  title: string;
  summary?: string;
  byline?: string;
  /** ISO date (or datetime) shown on cards. */
  date?: string;
}

/** Build-time lookups the synchronous renderer reads from. */
export interface RenderContext {
  /** hm:// link (as written in the block) → resolved target, or null if unresolvable. */
  docs?: Map<string, DocRef | null>;
  /** http(s) URL → preview, or null if unavailable. */
  web?: Map<string, WebPreview | null>;
  /** Seed paths of the site account that have a page on this site. */
  routes?: Set<string>;
}

/** Escapes text for HTML content and double-quoted attributes. */
export const esc = (s: string) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const MENTION_PLACEHOLDER = "\uFFFC";

/** Raw (unescaped) safe href for a link, or null if it isn't navigable. */
export function safeHref(link: string, ctx: RenderContext = {}): string | null {
  const l = link.trim();
  if (/^https?:\/\//i.test(l) || /^mailto:/i.test(l)) return l;
  const hm = parseHmLink(l);
  if (!hm) return null;
  const hash = hm.blockRef ? `#${encodeURIComponent(hm.blockRef)}` : "";
  if (hm.uid === SEED_ACCOUNT && hm.path && ctx.routes?.has(hm.path)) return `${hm.path}${hash}`;
  return `${seedDocUrl(hm.path, hm.uid, hm.version)}${hash}`;
}

const isInternal = (href: string) => href.startsWith("/");
const linkAttrs = (href: string) =>
  `href="${esc(href)}"${isInternal(href) ? "" : ' target="_blank" rel="noopener noreferrer"'}`;

/** Label for an hm:// link whose target couldn't be resolved. */
function fallbackLabel(link: string): string {
  const hm = parseHmLink(link);
  if (!hm) return link;
  const last = hm.path.split("/").filter(Boolean).pop();
  return last ? decodeURIComponent(last).replace(/[-_]+/g, " ") : shortId(hm.uid);
}

function mentionHtml(link: string, ctx: RenderContext, kindHint?: unknown): string {
  const ref = ctx.docs?.get(link);
  const hm = parseHmLink(link);
  const kind = ref?.kind ?? (kindHint === "account" || (hm && !hm.path) ? "account" : "document");
  const label = ref?.title ?? fallbackLabel(link);
  const text = `${kind === "account" ? "@" : ""}${esc(label)}`;
  const href = safeHref(link, ctx);
  const title = ref ? ` title="${esc(ref.summary ? `${ref.title} — ${ref.summary}` : ref.title)}"` : "";
  return href
    ? `<a class="mention" data-kind="${kind}" ${linkAttrs(href)}${title}>${text}</a>`
    : `<span class="mention" data-kind="${kind}">${text}</span>`;
}

type Inline = Pick<SeedBlock, "text" | "link" | "annotations">;

/** Applies annotations (bold, italic, code, links, mentions…) to a block's text. */
function inline(block: Inline, ctx: RenderContext): string {
  const text = block.text ?? "";
  const anns: SeedAnnotation[] = block.annotations ?? [];
  if (!text) {
    // Block-level link on a text-less block.
    const href = block.link ? safeHref(block.link, ctx) : null;
    return href && block.link ? `<a ${linkAttrs(href)}>${esc(block.link)}</a>` : "";
  }
  // Offsets are in code points.
  const cps = [...text];
  const cuts = new Set<number>([0, cps.length]);
  for (const a of anns)
    for (let i = 0; i < a.starts.length; i++) {
      cuts.add(a.starts[i]);
      cuts.add(a.ends[i] ?? a.starts[i]);
    }
  const order = [...cuts].filter((c) => c >= 0 && c <= cps.length).sort((a, b) => a - b);
  let out = "";
  for (let i = 0; i + 1 < order.length; i++) {
    const [s, e] = [order[i], order[i + 1]];
    if (e <= s) continue;
    const active = anns.filter((a) => a.starts.some((st, j) => st <= s && (a.ends[j] ?? st) > s));
    const has = (t: string) => active.find((x) => x.type === t);
    const embed = has("Embed");
    if (embed?.link) {
      // An inline mention replaces its placeholder range; emit it once, at its start.
      if (embed.starts.includes(s)) out += mentionHtml(embed.link, ctx, embed.attributes?.mentionKind);
      continue;
    }
    let html = esc(cps.slice(s, e).join("").replaceAll(MENTION_PLACEHOLDER, ""));
    if (!html) continue;
    if (has("Code")) html = `<code>${html}</code>`;
    if (has("Bold")) html = `<strong>${html}</strong>`;
    if (has("Italic")) html = `<em>${html}</em>`;
    if (has("Underline")) html = `<u>${html}</u>`;
    if (has("Strike")) html = `<s>${html}</s>`;
    const link = has("Link");
    const href = link?.link ? safeHref(link.link, ctx) : null;
    if (link?.link && href) {
      if (parseHmLink(link.link)) {
        const ref = ctx.docs?.get(link.link);
        const title = ref ? ` title="${esc(ref.title)}"` : "";
        html = `<a class="hm-link" ${linkAttrs(href)}${title}>${html}</a>`;
      } else {
        html = `<a ${linkAttrs(href)}>${html}</a>`;
      }
    }
    out += html;
  }
  return out;
}

const ipfs = (ref: unknown) =>
  typeof ref === "string" && ref.startsWith("ipfs://") ? `${SEED_ORIGIN}/ipfs/${ref.slice("ipfs://".length)}` : null;

const mediaSrc = (b: SeedBlock) => {
  const ref = (b.attributes?.url as string | undefined) || b.link || "";
  return ipfs(ref) ?? (/^https?:\/\//i.test(ref) ? ref : null);
};

const host = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const shortDate = (iso: string | undefined) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })
    : undefined;
};

function embedHtml(b: SeedBlock, ctx: RenderContext, inner: string, id: string): string {
  const link = b.link ?? "";
  const href = safeHref(link, ctx);
  if (!href) return inner ? `<p${id}>${inner}</p>` : "";
  const ref = ctx.docs?.get(link);
  if (!ref) return `<p${id}><a ${linkAttrs(href)}>${inner || esc(fallbackLabel(link))}</a></p>`;
  const meta = [ref.byline, shortDate(ref.date)].filter(Boolean).map((m) => esc(m!)).join(" · ");
  const kicker = ref.kind === "account" ? "Profile" : isInternal(href) ? "On this site" : "On Seed";
  return (
    `<a class="embed-card" data-kind="${ref.kind}"${id} ${linkAttrs(href)}>` +
    `<span class="embed-card__kicker">${kicker}</span>` +
    `<span class="embed-card__title">${esc(ref.title)}</span>` +
    (ref.summary ? `<span class="embed-card__summary">${esc(ref.summary)}</span>` : "") +
    (meta ? `<span class="embed-card__meta">${meta}</span>` : "") +
    `</a>`
  );
}

function webEmbedHtml(b: SeedBlock, ctx: RenderContext, inner: string, id: string): string {
  const url = (b.link ?? "").trim();
  if (!/^https?:\/\//i.test(url)) return inner ? `<p${id}>${inner}</p>` : "";
  const p = ctx.web?.get(url);
  const img = p?.image
    ? `<img class="web-card__image" src="${esc(p.image)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
    : "";
  return (
    `<a class="web-card"${id} ${linkAttrs(url)}>${img}<span class="web-card__body">` +
    `<span class="web-card__site">${esc(p?.siteName ?? host(url))}</span>` +
    `<span class="web-card__title">${esc(p?.title ?? url)}</span>` +
    (p?.description ? `<span class="web-card__summary">${esc(p.description)}</span>` : "") +
    `</span></a>`
  );
}

function blockHtml(n: SeedBlockNode, ctx: RenderContext, depth: number): string {
  const b = n.block;
  // Link blocks wrap their own label; don't let inline() add a nested anchor.
  const linkBlock = b.type === "Embed" || b.type === "WebEmbed" || b.type === "Button";
  const inner = linkBlock && !b.text ? "" : inline(b, ctx);
  const id = b.id ? ` id="${esc(b.id)}"` : "";
  switch (b.type) {
    case "Paragraph":
      return inner ? `<p${id}>${inner}</p>` : "";
    case "Heading": {
      const h = Math.min(depth + 2, 4);
      return inner ? `<h${h}${id}>${inner}</h${h}>` : "";
    }
    case "Code": {
      const lang = b.attributes?.language;
      const cls = typeof lang === "string" && /^[\w+-]+$/.test(lang) ? ` class="language-${lang}"` : "";
      return `<pre${id}><code${cls}>${esc(b.text ?? "")}</code></pre>`;
    }
    case "Math":
      return `<pre class="math"${id}>${esc(b.text ?? "")}</pre>`;
    case "Image": {
      const src = mediaSrc(b);
      if (!src) return inner ? `<p${id}>${inner}</p>` : "";
      const alt = esc((b.attributes?.alt as string | undefined) ?? b.text ?? "");
      return `<figure${id}><img src="${esc(src)}" alt="${alt}" loading="lazy" decoding="async" />${inner ? `<figcaption>${inner}</figcaption>` : ""}</figure>`;
    }
    case "Video": {
      const src = mediaSrc(b);
      return src ? `<figure${id}><video src="${esc(src)}" controls preload="metadata"></video>${inner ? `<figcaption>${inner}</figcaption>` : ""}</figure>` : "";
    }
    case "File": {
      const src = mediaSrc(b) ?? safeHref(b.link ?? "", ctx);
      const name = (b.attributes?.name as string | undefined) || b.text || "Download file";
      return src ? `<p${id}><a class="file-link" ${linkAttrs(src)}>${esc(name)}</a></p>` : "";
    }
    case "Button": {
      const href = safeHref(b.link ?? "", ctx);
      const label = inner || esc((b.attributes?.name as string | undefined) || b.link || "");
      return href && label ? `<p${id}><a class="button" ${linkAttrs(href)}>${label}</a></p>` : "";
    }
    case "Embed":
      return embedHtml(b, ctx, inner, id);
    case "WebEmbed":
      return webEmbedHtml(b, ctx, inner, id);
    default:
      // Query, Nostr and unknown blocks degrade to their text (if any).
      return inner ? `<p${id}>${inner}</p>` : "";
  }
}

// `childrenType` says how a block's children are laid out: bullet/numbered
// list (items render inline, without <p>), blockquote, or a plain group.
function childrenHtml(n: SeedBlockNode, ctx: RenderContext, depth: number): string {
  const kids = n.children ?? [];
  if (!kids.length) return "";
  const type = n.block.attributes?.childrenType as string | undefined;
  const item = (c: SeedBlockNode) => {
    const body = ["Paragraph", "Heading"].includes(c.block.type) ? inline(c.block, ctx) : blockHtml(c, ctx, depth + 1);
    return `<li>${body}${childrenHtml(c, ctx, depth + 1)}</li>`;
  };
  if (type === "Unordered") return `<ul>${kids.map(item).join("")}</ul>`;
  if (type === "Ordered") return `<ol>${kids.map(item).join("")}</ol>`;
  if (type === "Blockquote") return `<blockquote>${kids.map((c) => node(c, ctx, depth + 1)).join("")}</blockquote>`;
  return kids.map((c) => node(c, ctx, depth + 1)).join("");
}

function node(n: SeedBlockNode, ctx: RenderContext, depth: number): string {
  return blockHtml(n, ctx, depth) + childrenHtml(n, ctx, depth);
}

/** HMBlockNode[] → HTML using already-resolved lookups. */
export function renderBlocks(nodes: SeedBlockNode[] | undefined, ctx: RenderContext = {}): string {
  return (nodes ?? []).map((n) => node(n, ctx, 0)).join("");
}

/** hm:// references (embeds, mentions, links) and web-embed URLs in a block tree. */
export function collectRefs(nodes: SeedBlockNode[] | undefined): { hm: Set<string>; web: Set<string> } {
  const hm = new Set<string>();
  const web = new Set<string>();
  const walk = (list: SeedBlockNode[]) => {
    for (const { block: b, children } of list) {
      if (b.type === "WebEmbed" && b.link && /^https?:\/\//i.test(b.link.trim())) web.add(b.link.trim());
      if (b.link && parseHmLink(b.link)) hm.add(b.link);
      for (const a of b.annotations ?? []) if (a.link && parseHmLink(a.link)) hm.add(a.link);
      walk(children ?? []);
    }
  };
  walk(nodes ?? []);
  return { hm, web };
}

/** Resolves an hm:// link to its card/mention data (null if unavailable). */
export async function resolveDocRef(link: string): Promise<DocRef | null> {
  const hm = parseHmLink(link);
  if (!hm) return null;
  if (!hm.path) {
    const name = await getAccountName(hm.uid);
    return name ? { kind: "account", title: name } : null;
  }
  const doc = await getResource(link);
  if (!doc) return null;
  const m = doc.metadata ?? {};
  const s = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
  const authors = await documentAuthors(doc);
  const created = s(doc.createTime);
  return {
    kind: "document",
    title: s(m.name) ?? fallbackLabel(link),
    summary: s(m.summary),
    byline: authors.map((a) => a.name).join(", ") || undefined,
    date: s(m.displayPublishTime) ?? (created?.startsWith("1970-01-01") ? undefined : created),
  };
}

/** Lookups used by {@link renderDocument}; injectable for tests. */
export interface Resolvers {
  routes?: Set<string>;
  doc?: (link: string) => Promise<DocRef | null>;
  web?: (url: string) => Promise<WebPreview | null>;
}

/** Resolves every reference in the tree at build time, then renders it. */
export async function renderDocument(nodes: SeedBlockNode[] | undefined, r: Resolvers = {}): Promise<string> {
  const { hm, web } = collectRefs(nodes);
  const docFn = r.doc ?? resolveDocRef;
  const webFn = r.web ?? fetchWebPreview;
  const safe = <T>(p: Promise<T | null>) => p.catch(() => null);
  const [docs, previews] = await Promise.all([
    Promise.all([...hm].map(async (l) => [l, await safe(docFn(l))] as const)),
    Promise.all([...web].map(async (u) => [u, await safe(webFn(u))] as const)),
  ]);
  return renderBlocks(nodes, { docs: new Map(docs), web: new Map(previews), routes: r.routes });
}
