# assets/

Static brand assets published with the repository and referenced by the
documentation site.

`.github/workflows/docs-pages.yml` copies this directory into the built site at
`/personal-bot/assets/`. The slots that point here:

| File | Used for | Where it is referenced |
| --- | --- | --- |
| `header.png` | Home page hero image | Uncomment `hero.image` in the frontmatter of `site/index.md` and `site/en/index.md` |
| `favicon.ico` | Browser tab icon | The `head` link entry in `site/.vitepress/config.mjs` (returns 404 until the file is added) |
| `architecture.svg` | Architecture diagram, English | `README.md` and `site/en/index.md` |
| `architecture.zh-CN.svg` | Architecture diagram, Chinese | `README.zh-CN.md` and `site/index.md` |

Mascot artwork belongs in this directory as well. If an asset uses a different
filename, update the corresponding path in the references above.

The two architecture diagrams are pre-rendered SVG: an SVG loaded through
`<img>` cannot fetch a web font, so their labels are glyph outlines rather than
text and they draw the same everywhere, CJK included. Regenerate them with
`pnpm render:diagram` from `release/` after editing
`release/diagram/architecture.mmd` or `release/diagram/architecture.zh-CN.mmd`;
never hand-edit the SVG.

The root `.gitignore` ignores `*.png` by default, with an exception for this
directory so published assets can be committed here.
