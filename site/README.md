# personal-bot docs site

Documentation site for the public repository, built with
[VitePress](https://vitepress.dev/). Chinese is the root locale (`/`), and
English lives under `/en/` with the same page structure and sidebar order.

```
site/
  index.md              Chinese home page
  en/index.md           English home page
  guide/*.md            Chinese guide pages
  en/guide/*.md         English guide pages
  .vitepress/config.mjs Site configuration (plain JavaScript: the release scan
                        rejects TypeScript sources and .git* files in
                        release/personal-bot)
  public/               Static assets copied verbatim to the site root
```

## Build and preview

```sh
pnpm install
pnpm docs:build      # output: .vitepress/dist
pnpm docs:dev        # local dev server
```

The published site is served at <https://4fuu.github.io/personal-bot/>, so
`.vitepress/config.mjs` sets `base: '/personal-bot/'`.

Build output (`.vitepress/dist`, `.vitepress/cache`) and `node_modules` must
never be committed. They are ignored by the root `.gitignore` (`site/` has no
`.gitignore` of its own because `release/lib/scan.mjs` rejects any `.git*` file
inside `release/personal-bot`).

## `mcp-client.json`

`https://4fuu.github.io/personal-bot/mcp-client.json` is the static OAuth Client
ID Metadata Document used when the console runs at `http://localhost:8080`. The
single source of truth is `../mcp-client.json` in the repository root; the
GitHub Pages workflow copies it into the site build artifact automatically.

## Images

- `../assets/` holds repository-level brand images (header banner, favicon,
  mascot). The Pages workflow copies that directory to `/personal-bot/assets/`
  in the build output; see `../assets/README.md` for expected filenames.
- `public/` holds static files specific to the docs site. Any console
  screenshots placed here must be captured against `apps/console` in mock mode
  (`pnpm mock-driver`, synthetic data only)—never from a live deployment.

Reference files under `public/` using root-relative paths that include the base
prefix (`/personal-bot/images/...`).
