# horacioh.com

Personal site of Horacio Herrera. A static [Astro](https://astro.build) site whose content comes entirely from a
[Seed Hypermedia](https://seed.hyper.media) site: write and publish in Seed, then rebuild.

- Astro (`output: "static"`), TypeScript strict, Tailwind CSS v4 (`@tailwindcss/vite`), Bun.
- Seed documents are pulled at build time through the site's public API; nothing is fetched in the browser.
- Served as plain files from `dist/` (nginx in Docker, on Coolify).

## Setup

```sh
bun install
cp .env.example .env   # fill in the Seed site (see below)
bun run dev            # http://localhost:4321
```

| Script              | What it does                                                         |
| ------------------- | -------------------------------------------------------------------- |
| `bun run dev`       | Dev server. Content is loaded from Seed on start.                    |
| `bun run build`     | `validate` → `astro check` → `astro build` into `dist/`.             |
| `bun run preview`   | Serves the built `dist/`.                                            |
| `bun run typecheck` | `astro check` (also syncs content, so it needs the Seed env).        |
| `bun run validate`  | `scripts/validate-content.ts`: schema + duplicate checks on Seed.    |
| `bun run test`      | `bun test`: renderer, embeds/mentions, web previews, content mapping. |

## Environment

All values are read at build time. **Placeholders until the Seed site is set up** — the build stops with a clear error
if the required ones are missing.

| Variable                 | Required | Example                     | Notes                                                                    |
| ------------------------ | -------- | --------------------------- | ------------------------------------------------------------------------ |
| `PUBLIC_SEED_ORIGIN`     | yes      | `https://<your-seed-site>`  | Public origin of the Seed site (serves `/api/*` and `/ipfs/*`).          |
| `PUBLIC_SEED_ACCOUNT`    | yes      | `z6Mk…`                     | Account ID (`hm://<account>`) that owns the site.                        |
| `PUBLIC_SEED_POSTS_PATH` | no       | `posts`                     | Path prefix of the posts. The build fails if it has no documents.        |
| `PUBLIC_SEED_PAGES_PATH` | no       | _(unset)_ or empty          | Standalone pages. Empty string = root-level docs (minus the posts path). |
| `SITE_URL`               | no       | `https://horacioh.com`      | Canonical URL for links, RSS and OG tags.                                |
| `WEB_PREVIEW_CACHE`      | no       | `off`                       | Path of the link-preview cache file, or `off`.                           |

## How content maps

- **Home**: the root document of the account (`hm://<account>`) gives the site name and intro (name + summary).
- **Posts**: every document under `/<PUBLIC_SEED_POSTS_PATH>/…` becomes `/<path>` on the site, listed newest first on
  the home page and in `/rss.xml`. Date = `displayPublishTime`, else the document's create time.
- **Pages** (optional): documents under `PUBLIC_SEED_PAGES_PATH`; top-level ones show up in the header nav.
- **Metadata box**: author(s) (`displayAuthor`, else the signers' profile names, else the account), published, updated,
  version (truncated CID) and a link to the live Seed document.

Loading lives in `src/lib/seed.ts` (API client: `GET /api/Resource`, CBOR `POST /api/QueryDocuments` with paging),
`src/lib/seed-loader.ts` (Astro loader; `doc.version` is the digest) and `src/content.config.ts`.

### Rendering

`src/lib/seed-render.ts` turns Seed blocks into HTML. Everything is escaped and links pass through `safeHref`
(only `http(s)`, `mailto`, `hm://` and relative links survive; `ipfs://` media goes through `PUBLIC_SEED_ORIGIN/ipfs/`).

- **Embed** blocks (`hm://…`) become a document card with the target's title, summary and byline, resolved at build
  time. Unresolvable targets fall back to a plain link.
- **WebEmbed** blocks become a link-preview card from the page's OpenGraph/`<title>` tags, fetched at build time and
  cached in `node_modules/.cache/horacioh.com/web-previews.json`. No iframes.
- **Mentions** and `hm://` inline links get mention styling and the target's title as label/tooltip.
- `hm://` links to this account's documents that exist on the site link to the site's own route; anything else goes to
  `https://hyper.media/hm/…` (or the Seed site for own docs without a page here).

## Deployment (Coolify)

1. New resource → this repo → build pack **Dockerfile** (port `80`).
2. Add the environment variables above, marked as **build variables** (the `Dockerfile` reads them as `ARG`s).
3. Deploy. The image runs tests + `bun run build` and serves `dist/` with nginx (`nginx.conf`).

### Rebuild on Seed updates

The site is static, so publishing in Seed does nothing until it is rebuilt. An external agent watches the Seed site and
triggers a Coolify deploy:

```sh
curl -fsS -X POST \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  "$COOLIFY_URL/api/v1/deploy?uuid=$COOLIFY_APP_UUID&force=true"
```

- `uuid` is the application's UUID (in its Coolify URL / settings), the token is a Coolify API token with deploy
  permission. Keep both in the agent's secrets.
- `force=true` rebuilds without the Docker build cache, so the content is always fetched fresh.
- **Debounce**: an edit session produces many updates. Trigger at most once after the site has been quiet for a few
  minutes (e.g. 2–5 min), and skip if nothing changed (compare the latest document versions/`updateTime` to the
  previous run).

## CI

`.github/workflows/ci.yml` runs `bun test`, `astro check` and the full build on pushes and PRs. The Seed-dependent
steps (typecheck and build) need the `PUBLIC_SEED_ORIGIN` / `PUBLIC_SEED_ACCOUNT` repository variables (Settings →
Secrets and variables → Actions → Variables) and are skipped until they are set.
