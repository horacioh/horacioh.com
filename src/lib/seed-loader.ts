// Astro content loader backed by a Seed site: lists the account's documents
// under the collection's path prefix, loads each one, and stores the rendered
// HTML with the document version (a CID) as digest.
import type { Loader } from "astro/loaders";
import { findDuplicates, listCollection, siteRoutes, toEntryData, type CollectionSpec } from "./content";
import { getDocument } from "./seed";
import { renderDocument } from "./seed-render";

/** Loader for one Seed-backed collection. */
export function seedLoader(spec: CollectionSpec): Loader {
  return {
    name: `seed-${spec.name}`,
    async load({ store, parseData, generateDigest, logger }) {
      const listed = await listCollection(spec);
      const where = spec.prefix ? `/${spec.prefix}` : "the account root";
      // Zero posts would deploy an empty site: fail the build instead.
      if (!listed.length && spec.required) throw new Error(`Seed returned no ${spec.name} under ${where}`);
      const routes = await siteRoutes();
      const entries = await Promise.all(
        listed.map(async ({ id, info }) => {
          const doc = await getDocument(info.path);
          const data = await parseData({ id, data: await toEntryData(doc) });
          const html = await renderDocument(doc.content, { routes });
          return { id, doc, data, html };
        }),
      );
      const dupes = findDuplicates(
        entries.map((e) => ({ collection: spec.name, id: e.id, data: e.data as { title: string; published?: Date } })),
      );
      if (dupes.length) throw new Error(`Seed ${spec.name}:\n  ${dupes.join("\n  ")}`);
      store.clear();
      for (const { id, doc, data, html } of entries) {
        store.set({ id, data, digest: doc.version || generateDigest(data), rendered: { html } });
      }
      logger.info(`${entries.length} ${spec.name} from Seed (${where})`);
    },
  };
}
