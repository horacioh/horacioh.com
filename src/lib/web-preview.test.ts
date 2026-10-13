import { afterAll, describe, expect, test } from "bun:test";
import { fetchWebPreview, parseWebPreview } from "./web-preview";

describe("parseWebPreview", () => {
  test("prefers OpenGraph, decodes entities, resolves relative images", () => {
    const html = `<head><title>Fallback</title>
      <meta property="og:title" content="Tom &amp; Jerry &#8212; &quot;live&quot;">
      <meta name="description" content='Plain desc'>
      <meta content="Example Site" property="og:site_name">
      <meta property="og:image" content="/img/card.png"></head>`;
    expect(parseWebPreview(html, "https://example.com/a/b")).toEqual({
      url: "https://example.com/a/b",
      title: 'Tom & Jerry — "live"',
      description: "Plain desc",
      siteName: "Example Site",
      image: "https://example.com/img/card.png",
    });
  });

  test("falls back to <title> and drops non-http images", () => {
    const p = parseWebPreview(`<title> Just  a title </title><meta property="og:image" content="javascript:alert(1)">`, "https://x.dev");
    expect(p.title).toBe("Just a title");
    expect(p.image).toBeUndefined();
  });
});

describe("fetchWebPreview", () => {
  const server = Bun.serve({
    port: 0,
    fetch(req) {
      const path = new URL(req.url).pathname;
      if (path === "/json") return Response.json({ title: "nope" });
      return new Response(`<html><head><meta property="og:title" content="Served"></head><body>${"x".repeat(1000)}</body></html>`, {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    },
  });
  afterAll(() => server.stop(true));

  test("fetches HTML pages and skips non-HTML or non-http URLs", async () => {
    expect((await fetchWebPreview(`${server.url}page`))?.title).toBe("Served");
    expect(await fetchWebPreview(`${server.url}json`)).toBeNull();
    expect(await fetchWebPreview("ftp://example.com")).toBeNull();
  });
});
