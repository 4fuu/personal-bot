# Environment variables (.env)

`.env` is a standard Docker Compose environment file placed next to
`compose.yaml`, containing only `KEY=value` lines and `#` comments. Copy
`.env.example` to `.env` and fill in the values below.

## Required variables

| Variable | Purpose |
| --- | --- |
| `CONSOLE_PASSWORD` | Password for signing into the web console. This is the only gate in front of the panel, so use a long, strong password |
| `DRIVER_TOKEN` | Internal bearer token for the driver API; the driver refuses to start without it, and only `console` and `bot` hold it |
| `BOT_TOKEN` | Internal bearer token for the bot API; held by the console server and never sent to the browser |
| `SANDBOX_EXEC_TOKEN` | Internal token used by `bot` to call the sandbox execution server; readable only by the root server process inside `sandbox`, never by the unprivileged command user |

Generate each of the three tokens with `openssl rand -hex 32`. They never leave
the internal stack, and each service receives only the tokens it needs.

## QQ package source (choose one)

| Variable | Purpose |
| --- | --- |
| `QQ_DEB_URL` | HTTP(S) URL from which the `qq` container downloads the pinned `.deb` on first start. Leave empty if you mount `/qq/QQ.deb` in `compose.yaml` instead |

If neither source is configured—or if both are set—the container exits and
prints instructions. See [First start and QR login](./first-start) for details.

## Optional variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PI_OFFLINE` | `0` | Set to `1` to disable fetching the online model catalog from `pi.dev` in offline environments |
| `KEYX_TIMEOUT_S` | `900` | Maximum seconds the first boot waits for database key extraction before continuing in the background (extraction takes up to ~8 minutes on a virtual display; increase on slower machines) |
| `PERSONAL_BOT_TAG` | empty (`latest`) | Container image tag to run. Leave empty to track `latest`, or set a release tag such as `v2026.1025.0` to pin a specific version |

## Assistant settings live in the console

Model selection, conversation allowlists and reply modes, persona fields, memory
limits, sandbox domain rules, message batching timers, and queue ordering are
all configured in the [web console](./console/). Changes take effect without
editing `.env` or recreating containers.

`compose.yaml` also defines `SCREEN_W` and `SCREEN_H` (`1280` × `800` by
default) on the `qq` service to set the virtual display resolution for the live
view. If you change them in `compose.yaml`, run `docker compose up -d` to
recreate the `qq` container with the new screen size.
