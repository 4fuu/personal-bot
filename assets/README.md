# assets/

Images the repository publishes, and the slots the documentation site fills from
here.

The docs site (`site/`) is built and published by
`.github/workflows/docs-pages.yml`, which copies this directory into the site
artifact at `/personal-bot/assets/`. Two places in the site already point here,
so dropping a file in with the expected name is all it takes:

| File | Used by | Slot |
| --- | --- | --- |
| `header.png` | the home page's header image | the marked block at the end of `site/index.md` and `site/en/index.md` - uncomment the `hero.image` line and the `<img>` under it |
| `favicon.ico` | the browser tab icon on every page | the `head` entry in `site/.vitepress/config.mjs` (live already; it 404s until this file lands) |

A mascot belongs here too, under whatever name the artwork gets.

If a file lands under a different name, change the two references above - they are
the only ones - and nothing else needs to move.

This repository's root `.gitignore` ignores `*.png`; the exception for this
directory is what lets the images be committed here at all.
