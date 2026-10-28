# Environment variables (.env)

`.env` is a plain env file next to `compose.yaml`: `KEY=value` lines and `#`
comments, nothing else. Copy `.env.example` to `.env` and fill it in. These are
all of the variables.

## Required

| Variable | What it is |
| --- | --- |
| `CONSOLE_PASSWORD` | the panel's password. It is the only thing standing between the internet and your panel, so make it long |
| `DRIVER_TOKEN` | one of the internal tokens; the driver refuses to start without it. The console and the bot use it to call the driver |
| `BOT_TOKEN` | one of the internal tokens; the console holds it and never hands it to the browser |
| `SANDBOX_EXEC_TOKEN` | one of the internal tokens; the bot uses it to call the sandbox, where only root can read it |

Generate the three tokens with `openssl rand -hex 32`. They never leave the
stack: each service gets only the ones it needs.

## QQ source: exactly one

| Variable | What it is |
| --- | --- |
| `QQ_DEB_URL` | the URL the `qq` container downloads the pinned build from. Leave it empty and mount a deb instead to install from a file |

With both set, or with neither, the container refuses to start and says so.
Details on [First start](./first-start).

## Optional

| Variable | Default | What it is |
| --- | --- | --- |
| `PI_OFFLINE` | `0` | `1` disables pi's model-catalog fetch, for fully offline runs |
| `KEYX_TIMEOUT_S` | `900` | how long the first boot waits for the database-key extraction. Measured at up to about 8 minutes, so raise it on a slow machine; a timeout is not fatal, the driver keeps watching |
| `PERSONAL_BOT_TAG` | empty (`latest`) | the image tag to run. Empty means the newest release; a tag such as `v2026.1025.0` pins one |

## The assistant's own settings are not environment variables

Which model, who may talk to it, what it may remember, which domains its commands
may reach, how messages are batched, how the queue orders - all of that lives in
the [console](./console/), takes effect as you change it, and needs neither an
`.env` edit nor a rebuild.

`compose.yaml` also carries two screen variables (`SCREEN_W`, `SCREEN_H`, 1280x800
by default) that set the live view's size; changing them means changing
`compose.yaml` and rebuilding the qq image.
