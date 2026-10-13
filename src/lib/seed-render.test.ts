import { describe, expect, test } from "bun:test";
import { SEED_ACCOUNT, SEED_ORIGIN, type SeedBlockNode } from "./seed";
import { collectRefs, renderBlocks, renderDocument, safeHref, type DocRef } from "./seed-render";

const OTHER = "z6MkotherAccount1234567890";
const node = (block: SeedBlockNode["block"], children: SeedBlockNode[] = []): SeedBlockNode => ({ block, children });
const p = (text: string, annotations: SeedBlockNode["block"]["annotations"] = []) =>
  node({ type: "Paragraph", id: "p1", text, annotations });

const doc = (title: string, extra: Partial<DocRef> = {}): DocRef => ({ kind: "document", title, ...extra });

describe("safeHref", () => {
  test("keeps http(s) and mailto, rejects script-ish schemes", () => {
    expect(safeHref("https://example.com/a?b=1")).toBe("https://example.com/a?b=1");
    expect(safeHref("mailto:hi@example.com")).toBe("mailto:hi@example.com");
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("data:text/html,<b>")).toBeNull();
  });

  test("own-account docs with a site page link to the site route", () => {
    const routes = new Set(["/posts/hello"]);
    expect(safeHref(`hm://${SEED_ACCOUNT}/posts/hello#blk1`, { routes })).toBe("/posts/hello#blk1");
    expect(safeHref(`hm://${SEED_ACCOUNT}/posts/hello?v=bafy123&l`, { routes })).toBe("/posts/hello");
    expect(safeHref(`hm://${SEED_ACCOUNT}/drafts/x`, { routes })).toBe(`${SEED_ORIGIN}/drafts/x`);
  });

  test("links pinned to a version stay on Seed", () => {
    const routes = new Set(["/posts/hello"]);
    expect(safeHref(`hm://${SEED_ACCOUNT}/posts/hello?v=bafy123`, { routes })).toBe(`${SEED_ORIGIN}/posts/hello?v=bafy123`);
  });

  test("other accounts go to the hyper.media gateway", () => {
    expect(safeHref(`hm://${OTHER}/notes/a?v=bafy9`)).toBe(`https://hyper.media/hm/${OTHER}/notes/a?v=bafy9`);
  });
});

describe("Embed blocks", () => {
  const embed = (link: string, view = "Card") => node({ type: "Embed", id: "e1", link, attributes: { view } });

  test("resolved embed renders a document card", () => {
    const link = `hm://${OTHER}/notes/a`;
    const html = renderBlocks([embed(link)], {
      docs: new Map([[link, doc("A <note>", { summary: "Sum & more", byline: "Ana", date: "2024-02-03" })]]),
    });
    expect(html).toContain('class="embed-card"');
    expect(html).toContain("A &lt;note&gt;");
    expect(html).toContain("Sum &amp; more");
    expect(html).toContain("Ana · Feb 3, 2024");
    expect(html).toContain(`href="https://hyper.media/hm/${OTHER}/notes/a"`);
    expect(html).toContain('target="_blank"');
  });

  test("internal embed links to the site route without target=_blank", () => {
    const link = `hm://${SEED_ACCOUNT}/posts/b`;
    const html = renderBlocks([embed(link)], { docs: new Map([[link, doc("B")]]), routes: new Set(["/posts/b"]) });
    expect(html).toContain('href="/posts/b"');
    expect(html).toContain("On this site");
    expect(html).not.toContain("target=");
  });

  test("unresolvable embed fails soft to a plain link", () => {
    const link = `hm://${OTHER}/notes/missing-doc`;
    const html = renderBlocks([embed(link)], { docs: new Map([[link, null]]) });
    expect(html).not.toContain("embed-card");
    expect(html).toBe(`<p id="e1"><a href="https://hyper.media/hm/${OTHER}/notes/missing-doc" target="_blank" rel="noopener noreferrer">missing doc</a></p>`);
  });

  test("malformed percent escapes don't break the fallback label", () => {
    const link = `hm://${OTHER}/notes/bad%E0%A4%A`;
    expect(renderBlocks([embed(link)], { docs: new Map([[link, null]]) })).toContain(">bad%E0%A4%A</a>");
  });

  test("non-hm embed link is dropped", () => {
    expect(renderBlocks([embed("javascript:alert(1)")])).toBe("");
  });
});

describe("WebEmbed blocks", () => {
  const web = (link: string) => node({ type: "WebEmbed", id: "w1", link });

  test("renders a preview card from fetched metadata, never an iframe", () => {
    const url = "https://example.com/post";
    const html = renderBlocks([web(url)], {
      web: new Map([[url, { url, title: 'Hi "there"', description: "Desc", siteName: "Example", image: "https://example.com/i.png" }]]),
    });
    expect(html).toContain('class="web-card"');
    expect(html).toContain("Hi &quot;there&quot;");
    expect(html).toContain('src="https://example.com/i.png"');
    expect(html).toContain('referrerpolicy="no-referrer"');
    expect(html).not.toContain("<iframe");
  });

  test("falls back to hostname + URL without a preview", () => {
    const url = "https://www.example.org/x";
    const html = renderBlocks([web(url)], { web: new Map([[url, null]]) });
    expect(html).toContain('<span class="web-card__site">example.org</span>');
    expect(html).toContain(`<span class="web-card__title">${url}</span>`);
    expect(html).not.toContain("<img");
  });

  test("ignores non-http URLs", () => {
    expect(renderBlocks([web("file:///etc/passwd")])).toBe("");
  });
});

describe("mentions and hm:// links", () => {
  test("inline Embed annotation becomes a mention labelled with the resolved title", () => {
    const link = `hm://${OTHER}/notes/a`;
    const html = renderBlocks([p("See \uFFFC now", [{ type: "Embed", starts: [4], ends: [5], link }])], {
      docs: new Map([[link, doc("The Note", { summary: "S" })]]),
    });
    expect(html).toBe(
      `<p id="p1">See <a class="mention" data-kind="document" href="https://hyper.media/hm/${OTHER}/notes/a" target="_blank" rel="noopener noreferrer" title="The Note — S">The Note</a> now</p>`,
    );
  });

  test("account mention uses @name and falls back to a short id", () => {
    const link = `hm://${OTHER}`;
    const ann = [{ type: "Embed", starts: [0], ends: [1], link, attributes: { mentionKind: "account" } }];
    const resolved = renderBlocks([p("\uFFFC", ann)], { docs: new Map([[link, { kind: "account", title: "Eric" }]]) });
    expect(resolved).toContain('data-kind="account"');
    expect(resolved).toContain(">@Eric</a>");
    const fallback = renderBlocks([p("\uFFFC", ann)], { docs: new Map([[link, null]]) });
    expect(fallback).toContain(">@z6Mkot…7890</a>");
  });

  test("mention overlapping other annotations is emitted once", () => {
    const link = `hm://${OTHER}/a`;
    const html = renderBlocks(
      [p("x\uFFFCy", [{ type: "Bold", starts: [0], ends: [3] }, { type: "Embed", starts: [1], ends: [2], link }])],
      { docs: new Map([[link, doc("T")]]) },
    );
    expect(html.match(/class="mention"/g)?.length).toBe(1);
    expect(html).toContain("<strong>x</strong>");
    expect(html).toContain("<strong>y</strong>");
  });

  test("hm:// Link annotations get mention-link styling and a title tooltip", () => {
    const link = `hm://${SEED_ACCOUNT}/posts/b`;
    const html = renderBlocks([p("read this", [{ type: "Link", starts: [5], ends: [9], link }])], {
      docs: new Map([[link, doc("Post B")]]),
      routes: new Set(["/posts/b"]),
    });
    expect(html).toBe('<p id="p1">read <a class="hm-link" href="/posts/b" title="Post B">this</a></p>');
  });

  test("unsafe link annotations render as plain text, text is escaped", () => {
    const html = renderBlocks([p("<b>x</b>", [{ type: "Link", starts: [0], ends: [8], link: "javascript:alert(1)" }])]);
    expect(html).toBe('<p id="p1">&lt;b&gt;x&lt;/b&gt;</p>');
  });
});

describe("other blocks", () => {
  test("ipfs images resolve through the Seed origin", () => {
    const html = renderBlocks([node({ type: "Image", id: "i1", text: "cap", link: "ipfs://bafyimg" })]);
    expect(html).toContain(`src="${SEED_ORIGIN}/ipfs/bafyimg"`);
    expect(html).toContain("<figcaption>cap</figcaption>");
  });

  test("heading levels follow nesting and lists render inline items", () => {
    const tree = [
      node({ type: "Heading", id: "h1", text: "Top" }, [
        node({ type: "Heading", id: "h2", text: "Sub", attributes: { childrenType: "Unordered" } }, [p("one"), p("two")]),
      ]),
    ];
    expect(renderBlocks(tree)).toBe('<h2 id="h1">Top</h2><h3 id="h2">Sub</h3><ul><li>one</li><li>two</li></ul>');
  });
});

describe("renderDocument", () => {
  test("collects and resolves every reference before rendering", async () => {
    const a = `hm://${OTHER}/a`;
    const b = `hm://${SEED_ACCOUNT}/posts/b`;
    const url = "https://example.com";
    const tree = [
      node({ type: "Embed", id: "e", link: a }),
      p("\uFFFC", [{ type: "Embed", starts: [0], ends: [1], link: b }]),
      node({ type: "WebEmbed", id: "w", link: url }),
    ];
    expect(collectRefs(tree)).toEqual({ hm: new Set([a, b]), web: new Set([url]) });
    const seen: string[] = [];
    const html = await renderDocument(tree, {
      routes: new Set(["/posts/b"]),
      doc: async (l) => (seen.push(l), l === a ? doc("Doc A") : l === b ? doc("Post B") : null),
      web: async () => {
        throw new Error("offline");
      },
    });
    expect(seen.sort()).toEqual([a, b].sort());
    expect(html).toContain("Doc A");
    expect(html).toContain('href="/posts/b"');
    expect(html).toContain("web-card__site");
  });
});
