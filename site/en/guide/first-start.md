# First start and QR login

No container image bundles the QQ client. On its first start, the `qq` container
installs the pinned `.deb` package from **exactly one** of two sources:

| Source | How to configure it |
| --- | --- |
| Download URL | Set `QQ_DEB_URL=https://example.com/QQ_3.2.34_260924_amd64_01.deb` in `.env` |
| Local `.deb` file | Uncomment the `/qq/QQ.deb` volume mount in `compose.yaml` and leave `QQ_DEB_URL` empty |

In both cases, the container verifies the file's SHA-256 digest against the
hash baked into the image and **refuses to install any other build**, printing
the expected version and digest on mismatch. The installed client lives in the
`qq_install` volume, so subsequent starts skip installation. If neither source
is provided—or if both are set—the container exits with instructions for both
options.

::: warning The official download URL returns 403
The official download URL requires a request signature and returns `403`
without one. If you download the `.deb` from a mirror, verify its SHA-256
digest yourself and mount it at `/qq/QQ.deb` in `compose.yaml` (or serve it
over HTTP at an address reachable from the container and set `QQ_DEB_URL`).
:::

## QR-code login

1. After running `docker compose up -d`, open <http://localhost:8080> and sign
   in with `CONSOLE_PASSWORD`.
2. Open the **QQ** page in the left sidebar. The **实时画面** card streams the
   client's screen; once the QR code appears, scan it with the mobile QQ app.
   **Initial QR login is always manual.**
3. Check **自动登录** on the client screen so future restarts resume without
   another QR scan.
4. Once sign-in completes, the driver extracts the database key and the
   **DB 密钥** indicator turns to **密钥正常** (**正常** on the **QQ** page).

Whenever the client returns to its saved-account screen after a restart, the
driver clicks **登录** automatically to resume the
session; the **登录** button on the **QQ** page lets you trigger that click
manually. You only need to scan a QR code again if you remove the `qq_profile`
volume.

## Database key extraction

The database key lets the driver read the client's local database. The driver
reads only a **private copy** of it and never modifies any file belonging to
the client. The key is stored on your host at
`data/driver/secrets/db_key` (mode `0600`) and never leaves your machine.

Extraction runs once on first login and remains valid across restarts. While
the status shows **缺失**, extraction is still in progress (check
`./logs/keyx.log` on the host). If the status shows **失效**, the client has
rotated its key or the database copy can no longer be read; follow the
re-extraction commands shown in the warning banner on the **QQ** page.

## Common startup errors

| Symptom | Cause and fix |
| --- | --- |
| `error: no QQ source: set exactly one of ...` | Neither `QQ_DEB_URL` nor a mounted `/qq/QQ.deb` was provided |
| `error: sha256 mismatch: expected ... got ...` | The `.deb` file does not match the pinned build; replace it with the exact pinned version |
| `error: both QQ_DEB_URL and the mounted deb ... are set` | Both sources are set; remove one of them |
| Live view stays on the QR code screen | Normal on first login—scan the QR code with the mobile app |
| Console pages return `502` | The `qq` or `bot` container is still starting; check `docker compose logs qq bot` |

See [Troubleshooting](./troubleshooting) for more diagnostic tips.
