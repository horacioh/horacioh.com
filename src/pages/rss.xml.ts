import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { getSiteInfo } from "../lib/seed";

export const GET: APIRoute = async ({ site }) => {
  const info = await getSiteInfo();
  const posts = (await getCollection("posts")).sort((a, b) => b.data.published.getTime() - a.data.published.getTime());
  return rss({
    title: info.name ?? "Horacio Herrera",
    description: info.summary ?? "Writing by Horacio Herrera",
    site: site ?? "https://horacioh.com",
    items: posts.slice(0, 50).map((p) => ({
      title: p.data.title,
      link: `/${p.id}`,
      pubDate: p.data.published,
      description: p.data.summary,
      author: p.data.authors.map((a) => a.name).join(", ") || undefined,
      content: p.rendered?.html,
    })),
  });
};
