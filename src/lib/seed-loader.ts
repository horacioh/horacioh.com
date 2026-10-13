import type { Loader } from "astro/loaders";
import {
  entryId,
  findDuplicateTitles,
  findDuplicates,
  resolveQuery,
  siteRoutes,
  toEntryData,
  toHomeData,
  type QueryDefinition,
} from "./content";
import { getDocument, listDocuments } from "./seed";
import { navigationLinks, renderDocument } from "./seed-render";

/** Loader for the account root document. */
export function homeLoader(): Loader {
  return {
    name: "seed-home",
    async load({ store, parseData, generateDigest, logger }) {
      const doc = await getDocument("");
      const documents = await listDocuments("");
      const routes = await siteRoutes();
      const data = await parseData({
        id: "home",
        data: {
          ...toHomeData(doc),
          nav: navigationLinks(doc.detachedBlocks?.navigation, routes),
        },
      });
      const html = await renderDocument(doc.content, {
        routes,
        query: async (block) =>
          resolveQuery(
            documents,
            (block.block.attributes?.query as QueryDefinition | undefined) ??
              {},
            "",
            (message) => logger.warn(message),
          ),
      });
      store.clear();
      store.set({
        id: "home",
        data,
        digest: doc.version || generateDigest(data),
        rendered: { html },
      });
      logger.info("Home document from Seed");
    },
  };
}

/** Loader for all safe non-root Seed document routes. */
export function docsLoader(): Loader {
  return {
    name: "seed-docs",
    async load({ store, parseData, generateDigest, logger }) {
      const documents = await listDocuments("");
      const routes = await siteRoutes();
      const listed = documents.flatMap((info) => {
        const id = entryId(info.path);
        return id ? [{ id, info }] : [];
      });
      const entries = await Promise.all(
        listed.map(async ({ id, info }) => {
          const doc = await getDocument(info.path ?? id);
          const data = await parseData({ id, data: await toEntryData(doc) });
          const html = await renderDocument(doc.content, {
            routes,
            query: async (block) =>
              resolveQuery(
                documents,
                (block.block.attributes?.query as
                  QueryDefinition | undefined) ?? {},
                info.path ?? "",
                (message) => logger.warn(message),
              ),
          });
          return { id, doc, data, html };
        }),
      );
      const checked = entries.map((entry) => ({
        collection: "docs",
        id: entry.id,
        data: entry.data as { title: string; published?: Date },
      }));
      const duplicates = findDuplicates(checked);
      if (duplicates.length)
        throw new Error(`Seed docs:\n  ${duplicates.join("\n  ")}`);
      for (const warning of findDuplicateTitles(checked)) logger.warn(warning);
      store.clear();
      for (const { id, doc, data, html } of entries) {
        store.set({
          id,
          data,
          digest: doc.version || generateDigest(data),
          rendered: { html },
        });
      }
      logger.info(`${entries.length} docs from Seed`);
    },
  };
}
