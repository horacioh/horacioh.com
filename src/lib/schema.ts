// Entry schemas shared by the content collections and scripts/validate-content.ts
// (scripts can't import src/content.config.ts: `astro:content` is a virtual module).
import { z } from "astro/zod";

const author = z.object({ id: z.string().optional(), name: z.string().min(1) });

/** Data of any Seed-backed entry. */
export const entrySchema = z.object({
  title: z.string().trim().min(1, "document has no title (metadata.name)"),
  summary: z.string().trim().min(1).optional(),
  published: z.coerce.date().optional(),
  updated: z.coerce.date().optional(),
  version: z.string().min(1),
  authors: z.array(author),
  /** Seed path with leading slash; also the site route. */
  path: z.string().startsWith("/"),
  /** Live Seed document URL. */
  source: z.url(),
  cover: z.url().optional(),
});

/** Posts must have a publish date to sort the index and the feed. */
export const postSchema = entrySchema.extend({ published: z.coerce.date() });

/** Inferred entry data. */
export type EntryData = z.infer<typeof entrySchema>;
