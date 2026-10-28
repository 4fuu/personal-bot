# First start and QR login

No image contains QQ. On its first start the `qq` container installs the pinned
build from **exactly one** of two sources:

| Source | How to give it |
| --- | --- |
| A download URL | `QQ_DEB_URL=https://example.com/QQ_3.2.34_260924_amd64_01.deb` in `.env` |
| A deb you already have | mount it at `/qq/QQ.deb` in `compose.yaml` (two lines to uncomment) and leave `QQ_DEB_URL` empty |

Either way the container verifies the file's sha256 against the pin baked into
the image and **refuses to install anything else**, with an error that names the
version it expected. The install lands in the `qq_install` volume, so later
starts skip it. If you give neither source, or both, the container says so and
prints both options rather than guessing.

::: warning The official download URL answers 403
The official URL does not serve the file without a signature. Download it from a
mirror, check its sha256 yourself, then either serve it locally
(`python3 -m http.server` plus `QQ_DEB_URL=http://127.0.0.1:8000/<file>`, with
`network_mode: host` for the install step) or mount it as a file.
:::

## QR login

1. After `docker compose up -d`, open <http://localhost:8080> and sign in with
   `CONSOLE_PASSWORD`.
2. The panel's QQ page (the live view) is the client's own screen. When the QR
   code appears, scan it with the phone app. **The scan is manual and yours to
   do** - it is the only login step that needs you.
3. Tick 自动登录 so later restarts resume without scanning.
4. Once the scan succeeds, the driver reads the database key and the status
   line's `db.key` turns to `"ok"`.

When the client returns to its account page after a restart, the driver clicks
登录 by itself and the saved session resumes; the 登录 button on the panel's QQ
page is the manual retry for that step. A new scan is needed only after the
profile has been recreated (the `qq_profile` volume removed).

## The key extraction

The key lets the stack decrypt a **private copy** of the client's own database -
message ids, senders, mentions, quotes and images all come from that copy, and no
file of the client is patched, replaced or written to. The key stays on your
machine: `data/driver/secrets/db_key`, mode 0600.

It is extracted once, on first login, and stays valid across restarts. A status
of `db.key = "missing"` means it has not finished; the log is `./logs/keyx.log`
on the host. A status of `"invalid"` means the client changed its key or the
copy no longer matches; follow the re-extract steps on the QQ page.

## When something is wrong

| Symptom | What it means |
| --- | --- |
| `error: no QQ source: set exactly one of ...` | neither `QQ_DEB_URL` nor a mounted deb was given |
| `error: sha256 mismatch: expected ... got ...` | the deb is not the pinned build; get the right file |
| `error: both QQ_DEB_URL and the mounted deb ... are set` | remove one of the two |
| The live view stays on the QR code | that is correct: a QR login is manual and yours to do |
| The panel's pages answer 502 | the driver or the bot is not up yet; check `docker compose logs qq bot` |

More in [Troubleshooting](./troubleshooting).
