# personal-bot docs site

The documentation site for the public repository, built with
[VitePress](https://vitepress.dev/) - the same generator MaiBot's docs use.
Chinese is the default locale and lives at the site root; English is the
`en/` mirror. Both locales carry the same page structure.

```
site/
  index.md              中文首页
  en/index.md           English home
  guide/*.md            中文页面
  en/guide/*.md         English mirror
  .vitepress/config.mjs the whole site configuration (plain JavaScript:
                        release/personal-bot is scanned before it becomes the
                        public repository, and the scan refuses TypeScript
                        sources and any file named .git*)
  public/               static files copied to the site root
```

## Build

```sh
pnpm install
pnpm docs:build      # output: .vitepress/dist
pnpm docs:dev        # local preview
```

The published site is <https://4fuu.github.io/personal-bot/>, so the config
sets `base: '/personal-bot/'`.

Build output (`.vitepress/dist`, `.vitepress/cache`) and `node_modules` must
never be committed. This repository's root `.gitignore` ignores them; the site
directory carries no `.gitignore` of its own because the release scan refuses any
file whose name starts with `.git`, and `release/personal-bot` is scanned as the
public repository's tree.

## mcp-client.json

`https://4fuu.github.io/personal-bot/mcp-client.json` is the MCP Client ID
Metadata Document MCP OAuth clients point at, and it has to keep answering at
exactly that URL. The repository's own `mcp-client.json` is the single source of
truth; the deploy workflow copies it into the build output after the build, so
there is no second copy to keep in step.

## Images

Two directories, two jobs:

- `../assets/` (the repository's own) holds the images the site publishes: the
  header banner, the favicon and the mascot. The workflow copies the whole
  directory into the artifact at `/personal-bot/assets/`, and the two slots -
  the commented `hero.image` in `index.md` / `en/index.md` and the favicon
  `head` entry in `.vitepress/config.mjs` - already point there.
  `../assets/README.md` documents the expected file names.
- `public/` holds the site's own static files, copied to the site root as they
  are. Console screenshots belong here, and they may only be taken from the
  console's mock mode (`pnpm mock-driver` in `apps/console`, synthetic data) -
  never from a real deployment.

Reference an image under `public/` with a root-relative path
(`/personal-bot/images/...`), because `base` prefixes absolute paths.
