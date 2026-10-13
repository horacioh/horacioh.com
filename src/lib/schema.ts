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

/** Data for the root document and its navigation. */
export const homeSchema = z.object({
  name: z.string().trim().min(1),
  summary: z.string().trim().min(1).optional(),
  nav: z.array(z.object({ label: z.string().min(1), href: z.string().min(1) })),
});

/** Inferred entry data. */
export type EntryData = z.infer<typeof entrySchema>;
