import { describe, expect, test } from "bun:test";
import {
  entryId,
  findDuplicateTitles,
  findDuplicates,
  resolveQuery,
  toEntryData,
  type CheckedEntry,
} from "./content";
import { SEED_ACCOUNT, documentAuthors, type SeedDocumentInfo } from "./seed";
import { entrySchema } from "./schema";

describe("entryId", () => {
  test("accepts nested routes and rejects the root, reserved routes, and dotted segments", () => {
    expect(entryId("/projects/a/b")).toBe("projects/a/b");
    expect(entryId(undefined)).toBeNull();
    expect(entryId("/writing")).toBe("writing");
    expect(entryId("/")).toBeNull();
    expect(entryId("/rss.xml")).toBeNull();
    expect(entryId("/projects/a.b")).toBeNull();
    expect(entryId("/notes/logo.png")).toBeNull();
  });
});

describe("authors", () => {
  const base = {
    account: "z6MkOwner",
    metadata: {} as Record<string, unknown>,
  };
  const names = async (uid: string) =>
    uid === "z6MkAnaAccount1234" ? "Ana" : undefined;

  test("explicit byline wins over signers", async () => {
    expect(
      await documentAuthors(
        { ...base, metadata: { displayAuthor: "Ana, Bo" }, authors: ["x"] },
        names,
      ),
    ).toEqual([{ name: "Ana" }, { name: "Bo" }]);
  });

  test("displayAuthor replaces metadata.authors", async () => {
    expect(
      await documentAuthors(
        { ...base, metadata: { displayAuthor: "Ana", authors: ["Bo"] } },
        names,
      ),
    ).toEqual([{ name: "Ana" }]);
    expect(
      await documentAuthors({ ...base, metadata: { authors: ["Bo"] } }, names),
    ).toEqual([{ name: "Bo" }]);
  });

  test("signers are resolved to names, falling back to short ids and then the account", async () => {
    expect(
      await documentAuthors(
        { ...base, authors: ["z6MkAnaAccount1234", "z6MkUnknownAcct9876"] },
        names,
      ),
    ).toEqual([
      { id: "z6MkAnaAccount1234", name: "Ana" },
      { id: "z6MkUnknownAcct9876", name: "z6MkUn…9876" },
    ]);
    expect(await documentAuthors({ ...base, authors: [] }, names)).toEqual([
      { id: "z6MkOwner", name: "z6MkOwner" },
    ]);
  });
});

describe("toEntryData and schema", () => {
  test("uses displayPublishTime, ignores epoch createTime, and validates", async () => {
    const raw = await toEntryData(
      {
        account: "z6MkOwner",
        path: "/writing/a",
        version: "bafyv",
        createTime: "1970-01-01T00:00:00Z",
        updateTime: "2025-01-02T00:00:00Z",
        metadata: {
          name: " A ",
          summary: "S",
          displayPublishTime: "2024-05-06",
        },
      },
      async () => [{ name: "H" }],
    );
    const result = entrySchema.parse(raw);
    expect(result.title).toBe("A");
    expect(result.published?.toISOString().slice(0, 10)).toBe("2024-05-06");
    expect(result.path).toBe("/writing/a");
  });

  test("allows index documents without dates", async () => {
    const raw = await toEntryData(
      {
        account: "a",
        path: "/writing",
        version: "v",
        createTime: "1970-01-01T00:00:00Z",
        metadata: { name: "Writing" },
      },
      async () => [],
    );
    const result = entrySchema.parse(raw);
    expect(result.published).toBeUndefined();
  });
});

const document = (
  path: string,
  title: string,
  createTime = "2024-01-01T00:00:00Z",
  updateTime = "2024-01-01T00:00:00Z",
): SeedDocumentInfo => ({
  account: SEED_ACCOUNT,
  path,
  metadata: { name: title },
  version: "v",
  createTime,
  updateTime,
});

describe("resolveQuery", () => {
  const docs = [
    document("", "Home"),
    document("/projects", "Projects"),
    document("/projects/a", "A", "2024-01-01T00:00:00Z", "2024-01-03T00:00:00Z"),
    document("/projects/a/nested", "Nested", "2024-01-01T00:00:00Z", "2024-01-04T00:00:00Z"),
    document("/projects/b", "B", "2024-01-01T00:00:00Z", "2024-01-02T00:00:00Z"),
    document(
      "/writing/a",
      "Older",
      "2023-01-01T00:00:00Z",
      "2023-01-01T00:00:00Z",
    ),
    document(
      "/writing/b",
      "Newest",
      "2024-01-01T00:00:00Z",
      "2025-01-01T00:00:00Z",
    ),
    document(
      "/writing/c",
      "Middle",
      "2024-01-01T00:00:00Z",
      "2024-01-01T00:00:00Z",
    ),
  ];

  test("distinguishes direct children from all descendants", () => {
    const children = resolveQuery(
      docs,
      {
        includes: [{ space: SEED_ACCOUNT, path: "projects", mode: "Children" }],
      },
      "/projects",
    );
    expect(children.documents.map((entry) => entry.path)).toEqual([
      "/projects/a",
      "/projects/b",
    ]);

    const descendants = resolveQuery(
      docs,
      {
        includes: [
          { space: SEED_ACCOUNT, path: "projects", mode: "AllDescendants" },
        ],
      },
      "/projects/a",
    );
    expect(descendants.documents.map((entry) => entry.path)).toEqual([
      "/projects/a/nested",
      "/projects/b",
    ]);
  });

  test("excludes root and the querying document", () => {
    const result = resolveQuery(
      docs,
      {
        includes: [{ space: SEED_ACCOUNT, path: "", mode: "AllDescendants" }],
      },
      "/projects/a",
    );
    expect(result.documents.some((entry) => entry.path === "")).toBe(false);
    expect(result.documents.some((entry) => entry.path === "/projects/a")).toBe(
      false,
    );
  });

  test("sorts by the selected term and reverse direction before applying the limit", () => {
    const query = {
      includes: [
        { space: SEED_ACCOUNT, path: "writing", mode: "Children" as const },
      ],
      sort: [{ term: "updated", reverse: true }],
      limit: 2,
    };
    const newest = resolveQuery(docs, query, "/writing");
    expect(newest.sortTerm).toBe("updated");
    expect(newest.documents.map((entry) => entry.path)).toEqual([
      "/writing/b",
      "/writing/c",
    ]);

    const oldest = resolveQuery(
      docs,
      { ...query, sort: [{ term: "updated", reverse: false }] },
      "/writing",
    );
    expect(oldest.documents.map((entry) => entry.path)).toEqual([
      "/writing/a",
      "/writing/c",
    ]);
  });

  test("foreign-space includes produce no results and a warning", () => {
    const warnings: string[] = [];
    const result = resolveQuery(
      docs,
      {
        includes: [{ space: "z6MkForeign", path: "", mode: "AllDescendants" }],
      },
      "/",
      (message) => warnings.push(message),
    );
    expect(result.documents).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("unsupported space");
  });
});

describe("duplicate checks", () => {
  test("route collisions are errors while duplicate titles and dates are warnings", () => {
    const date = new Date("2024-01-01T00:00:00Z");
    const entries: CheckedEntry[] = [
      {
        collection: "docs",
        id: "projects/A",
        data: { title: "Hello", published: date },
      },
      {
        collection: "docs",
        id: "projects/a",
        data: { title: "hello ", published: date },
      },
      {
        collection: "docs",
        id: "writing/third",
        data: { title: "HELLO", published: date },
      },
    ];
    expect(findDuplicates(entries)).toEqual([
      "duplicate route /projects/a: docs/projects/A and docs/projects/a",
    ]);
    expect(findDuplicateTitles(entries)).toEqual([
      'duplicate title + date "hello " (2024-01-01): docs/projects/A and docs/projects/a',
      'duplicate title + date "HELLO" (2024-01-01): docs/projects/A and docs/writing/third',
    ]);
  });
});
