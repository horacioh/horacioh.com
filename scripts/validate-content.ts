// Checks the Seed account before building: safe routes and metadata must pass
// their schemas; duplicate routes are errors and duplicate title/date pairs warn.
//   bun run validate
import {
  entryId,
  findDuplicateTitles,
  findDuplicates,
  siteRoutes,
  toEntryData,
  toHomeData,
  type CheckedEntry,
} from "../src/lib/content";
import { entrySchema, homeSchema } from "../src/lib/schema";
import {
  getDocument,
  listDocuments,
  shortId,
  type SeedDocumentInfo,
} from "../src/lib/seed";
import { navigationLinks } from "../src/lib/seed-render";

// Listing info is enough for the schema; skip profile lookups to keep it fast.
const noLookup = async (d: SeedDocumentInfo) => [
  { id: d.account, name: shortId(d.account) },
];

const errors: string[] = [];
const checked: CheckedEntry[] = [];
const documents = await listDocuments("");
for (const info of documents) {
  const id = entryId(info.path);
  if (!id) continue;
  const result = entrySchema.safeParse(await toEntryData(info, noLookup));
  if (!result.success) {
    errors.push(
      `docs/${id}: ${result.error.issues.map((issue) => `${issue.path.join(".") || "entry"}: ${issue.message}`).join("; ")}`,
    );
    continue;
  }
  checked.push({ collection: "docs", id, data: result.data });
}
console.log(`docs: ${checked.length} safe document routes`);

const routes = await siteRoutes();
const home = await getDocument("");
const homeResult = homeSchema.safeParse({
  ...toHomeData(home),
  nav: navigationLinks(home.detachedBlocks?.navigation, routes),
});
if (!homeResult.success) {
  errors.push(
    `home: ${homeResult.error.issues.map((issue) => `${issue.path.join(".") || "entry"}: ${issue.message}`).join("; ")}`,
  );
}

errors.push(...findDuplicates(checked));
for (const warning of findDuplicateTitles(checked))
  console.warn(`warning: ${warning}`);

if (errors.length) {
  console.error(`\n${errors.length} problem(s):\n  ${errors.join("\n  ")}`);
  process.exit(1);
}
console.log("Seed content OK");
