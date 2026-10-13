import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const FEED_SECTIONS = ["writing", "short-posts"] as const;

export const GET: APIRoute = async ({ site }) => {
  const [home] = await getCollection("home");
  const docs = await getCollection("docs");
  const items = docs
    .filter((entry) => {
      const parts = entry.data.path.split("/").filter(Boolean);
      return (
        parts.length === 2 &&
        FEED_SECTIONS.includes(parts[0] as (typeof FEED_SECTIONS)[number])
      );
    })
    .map((entry) => ({
      entry,
      date: entry.data.published ?? entry.data.updated,
    }))
    .filter((item) => Boolean(item.date))
    .sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0))
    .slice(0, 50);
  return rss({
    title: home?.data.name ?? "Horacio Herrera",
    description: home?.data.summary ?? "Writing by Horacio Herrera",
    site: site ?? "https://horacioh.com",
    items: items.map(({ entry, date }) => ({
      title: entry.data.title,
      link: `/${entry.id}`,
      pubDate: date!,
      description: entry.data.summary,
      author: entry.data.authors.map((a) => a.name).join(", ") || undefined,
      content: entry.rendered?.html,
    })),
  });
};
