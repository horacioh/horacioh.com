// Checks the Seed site before building: every document of every collection
// must pass its schema, and there must be no duplicate routes or titles.
//   bun run validate
import { COLLECTIONS, findDuplicates, listCollection, toEntryData, type CheckedEntry } from "../src/lib/content";
import { entrySchema, postSchema } from "../src/lib/schema";
import { getDocument, shortId, type SeedDocumentInfo } from "../src/lib/seed";

// Listing info is enough for the schema; skip profile lookups to keep it fast.
const noLookup = async (d: SeedDocumentInfo) => [{ id: d.account, name: shortId(d.account) }];

const errors: string[] = [];
const checked: CheckedEntry[] = [];
for (const spec of COLLECTIONS) {
  const listed = await listCollection(spec);
  if (!listed.length && spec.required) errors.push(`${spec.name}: no documents under /${spec.prefix}`);
  const schema = spec.name === "posts" ? postSchema : entrySchema;
  for (const { id, info } of listed) {
    const res = schema.safeParse(await toEntryData(info, noLookup));
    if (!res.success) {
      errors.push(`${spec.name}/${id}: ${res.error.issues.map((i) => `${i.path.join(".") || "entry"}: ${i.message}`).join("; ")}`);
      continue;
    }
    checked.push({ collection: spec.name, id, data: res.data });
  }
  console.log(`${spec.name}: ${listed.length} documents under ${spec.prefix ? `/${spec.prefix}` : "/"}`);
}
errors.push(...findDuplicates(checked));
// Make sure the home document (site title/intro) is reachable too.
await getDocument("").catch((e: Error) => console.warn(`warning: home document unavailable (${e.message})`));

if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log("Seed content OK");
