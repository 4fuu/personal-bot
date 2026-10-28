# assets/

Static brand assets published with the repository and referenced by the
documentation site.

`.github/workflows/docs-pages.yml` copies this directory into the built site at
`/personal-bot/assets/`. The files that exist today:

| File | Used for | Where it is referenced |
| --- | --- | --- |
| `mascot-hero.png` | Home page hero image (a web-sized copy of the mascot) | `hero.image` in the frontmatter of `site/index.md` and `site/en/index.md` |
| `mascot.png` | The mascot at full size, 1024 px, transparent | the source of `mascot-hero.png` and of the mascot embedded in `header.svg` |
| `mascot-face.png` | Face-and-bust crop of the mascot | kept for reuse |
| `header.svg` | README header banner, 1600x520 | the top of `README.md` and `README.zh-CN.md` |
| `social-preview.png` | GitHub social preview, 1280x640 | set by hand in the repository's settings; nothing references it |
| `architecture.svg` | Architecture diagram, English | `README.md` and `site/en/index.md` |
| `architecture.zh-CN.svg` | Architecture diagram, Chinese | `README.zh-CN.md` and `site/index.md` |
| `favicon.svg`, `favicon.ico` | Browser tab icon | the `head` link entries in `site/.vitepress/config.mjs`; the console serves its own copies from `apps/console/web/public/` |

If an asset lands under another filename, update the path in the reference
named above.

The two architecture diagrams are pre-rendered SVG: an SVG loaded through
`<img>` cannot fetch a web font, so their labels are glyph outlines rather than
text and they draw the same everywhere, CJK included. Regenerate them with
`pnpm render:diagram` from `release/` after editing
`release/diagram/architecture.mmd` or `release/diagram/architecture.zh-CN.mmd`;
never hand-edit the SVG.

The root `.gitignore` ignores `*.png` by default, with an exception for this
directory so published assets can be committed here.
