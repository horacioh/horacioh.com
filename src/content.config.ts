import { defineCollection } from "astro:content";
import { docsLoader, homeLoader } from "./lib/seed-loader";
import { entrySchema, homeSchema } from "./lib/schema";

const home = defineCollection({ loader: homeLoader(), schema: homeSchema });
const docs = defineCollection({ loader: docsLoader(), schema: entrySchema });

export const collections = { home, docs };
