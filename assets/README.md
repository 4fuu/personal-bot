# assets/

Static brand assets published with the repository and referenced by the
documentation site.

`.github/workflows/docs-pages.yml` copies this directory into the built site at
`/personal-bot/assets/`. Two slots in `site/` already point here:

| File | Used for | Where it is referenced |
| --- | --- | --- |
| `header.png` | Home page hero image | Uncomment `hero.image` in the frontmatter of `site/index.md` and `site/en/index.md` |
| `favicon.ico` | Browser tab icon | The `head` link entry in `site/.vitepress/config.mjs` (returns 404 until the file is added) |

Mascot artwork belongs in this directory as well. If an asset uses a different
filename, update the corresponding path in the two references above.

The root `.gitignore` ignores `*.png` by default, with an exception for this
directory so published assets can be committed here.
