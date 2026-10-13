import { describe, expect, test } from "bun:test";
import { entryId, findDuplicates, toEntryData, type CollectionSpec } from "./content";
import { documentAuthors } from "./seed";
import { postSchema } from "./schema";

const posts: CollectionSpec = { name: "posts", prefix: "posts", exclude: [], required: true };
const rootPages: CollectionSpec = { name: "pages", prefix: "", exclude: ["posts"], required: false };

describe("entryId", () => {
  test("maps Seed paths to routes and skips the collection index", () => {
    expect(entryId("/posts/hello", posts)).toBe("posts/hello");
    expect(entryId("/posts/2024/deep", posts)).toBe("posts/2024/deep");
    expect(entryId("/posts", posts)).toBeNull();
    expect(entryId("/postscript", posts)).toBeNull();
  });

  test("root pages exclude the home doc, posts and reserved routes", () => {
    expect(entryId("/about", rootPages)).toBe("about");
    expect(entryId("/", rootPages)).toBeNull();
    expect(entryId("/posts/hello", rootPages)).toBeNull();
    expect(entryId("/rss.xml", rootPages)).toBeNull();
    expect(entryId("/favicon.svg", rootPages)).toBeNull();
    expect(entryId("/notes/logo.png", rootPages)).toBeNull();
  });
});

describe("authors", () => {
  const base = { account: "z6MkOwner", metadata: {} as Record<string, unknown> };
  const names = async (uid: string) => (uid === "z6MkAnaAccount1234" ? "Ana" : undefined);

  test("explicit byline wins over signers", async () => {
    expect(await documentAuthors({ ...base, metadata: { displayAuthor: "Ana, Bo" }, authors: ["x"] }, names)).toEqual([
      { name: "Ana" },
      { name: "Bo" },
    ]);
  });

  test("displayAuthor replaces metadata.authors", async () => {
    expect(await documentAuthors({ ...base, metadata: { displayAuthor: "Ana", authors: ["Bo"] } }, names)).toEqual([{ name: "Ana" }]);
    expect(await documentAuthors({ ...base, metadata: { authors: ["Bo"] } }, names)).toEqual([{ name: "Bo" }]);
  });

  test("signers are resolved to names, falling back to short ids and then the account", async () => {
    expect(await documentAuthors({ ...base, authors: ["z6MkAnaAccount1234", "z6MkUnknownAcct9876"] }, names)).toEqual([
      { id: "z6MkAnaAccount1234", name: "Ana" },
      { id: "z6MkUnknownAcct9876", name: "z6MkUn…9876" },
    ]);
    expect(await documentAuthors({ ...base, authors: [] }, names)).toEqual([{ id: "z6MkOwner", name: "z6MkOwner" }]);
  });
});

describe("toEntryData + schema", () => {
  test("uses displayPublishTime, ignores epoch createTime, validates", async () => {
    const raw = await toEntryData(
      {
        account: "z6MkOwner",
        path: "/posts/a",
        version: "bafyv",
        createTime: "1970-01-01T00:00:00Z",
        updateTime: "2025-01-02T00:00:00Z",
        metadata: { name: " A ", summary: "S", displayPublishTime: "2024-05-06" },
      },
      async () => [{ name: "H" }],
    );
    const data = postSchema.parse(raw);
    expect(data.title).toBe("A");
    expect(data.published.toISOString().slice(0, 10)).toBe("2024-05-06");
    expect(data.path).toBe("/posts/a");
  });

  test("posts without any date fail the schema", async () => {
    const raw = await toEntryData(
      { account: "a", path: "/posts/b", version: "v", createTime: "1970-01-01T00:00:00Z", metadata: { name: "B" } },
      async () => [],
    );
    expect(postSchema.safeParse(raw).success).toBe(false);
  });
});

describe("findDuplicates", () => {
  test("flags route collisions and same title on the same day", () => {
    const d = new Date("2024-01-01");
    const errs = findDuplicates([
      { collection: "posts", id: "posts/a", data: { title: "Hello", published: d } },
      { collection: "posts", id: "posts/b", data: { title: "hello ", published: d } },
      { collection: "pages", id: "Posts/A", data: { title: "Other" } },
    ]);
    expect(errs).toHaveLength(2);
    expect(errs.some((e) => e.startsWith("duplicate route /Posts/A"))).toBe(true);
    expect(errs.some((e) => e.startsWith("duplicate title + date"))).toBe(true);
  });
});
