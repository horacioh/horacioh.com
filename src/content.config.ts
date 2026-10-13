import { defineCollection } from "astro:content";
import { COLLECTIONS } from "./lib/content";
import { entrySchema, postSchema } from "./lib/schema";
import { seedLoader } from "./lib/seed-loader";

const spec = (name: "posts" | "pages") => COLLECTIONS.find((c) => c.name === name);
const postsSpec = spec("posts")!;
const pagesSpec = spec("pages");

const posts = defineCollection({ loader: seedLoader(postsSpec), schema: postSchema });

// PUBLIC_SEED_PAGES_PATH unset → the collection exists but stays empty.
const pages = defineCollection({
  loader: pagesSpec ? seedLoader(pagesSpec) : { name: "seed-pages-disabled", load: async ({ store }) => store.clear() },
  schema: entrySchema,
});

export const collections = { posts, pages };
