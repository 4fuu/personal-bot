<div align="center">

# personal-bot

**A self-hosted personal assistant that runs on your own machine, keeps its
memory in files you own, and answers in the chats you already use.**

[Quick start](#quick-start) ·
[First start](#first-start) ·
[Configuration](#configuration) ·
[How it works](#how-it-works) · [Disclaimer](#disclaimer)

</div>

> **Warning.** This project drives a third-party desktop client, which is outside
> that client's terms of service and can get an account restricted or lost. Use a
> secondary account, a residential connection and the default pacing. Private
> research project, provided as is, and all of the risk is yours.
> Read [DISCLAIMER.md](DISCLAIMER.md) before you run anything.

---

## What it is

Four containers. One of them runs a chat client on a virtual display; the other
three are the assistant, the panel you drive it from, and a sandbox the
assistant's commands run in.

```
┌────────────────────────────── one stack = one account ──────────────────────────┐
│                                                                                  │
│  chat client (official, unmodified, headless)                                    │
│    │ writes              ▲ sends              ▲ clicks 登录                       │
│    ▼                     │                    │                                  │
│  private decrypted copy ──▶ driver API (HTTP + WebSocket)                        │
│                              │                        │                          │
│                              ▼                        ▼                          │
│                          console :8080            bot :8766                      │
│                          (the panel,              (the agent, notes,             │
│                           the live view)           the send review)              │
│                                                      │                           │
│                                                      ▼                           │
│                                                  sandbox :8791                   │
│                                                  (every command, as an           │
│                                                   unprivileged user)             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

- **Read.** Received messages appear in the client's own local database within a
  couple of seconds. The stack decrypts a *private copy* of it, so it gets real
  message ids, senders, mentions, quotes and image files without touching the
  client's process.
- **Write.** Text, images, stickers, @mentions and quote replies go through the
  client's own send function, paced by one action queue with human-like jitter.
- **Contact with the client's process.** One `gdb` breakpoint at first login, to
  read the database key - which then stays valid across restarts - and a small
  library the container preloads into the client at launch, which serves sends.
  No file of the client is patched, replaced or written to.

### The backend, plainly

The chat backend is the **official QQ NT desktop client for Linux**, the pinned
build recorded in the release notes, running unmodified inside the `qq`
container on a TigerVNC display. Everything the assistant knows about your chats
comes from a decrypted copy of that client's own database, and everything it
sends goes through that client's own send path.

The stack does not read the client's events, does not watch its process, and
does not use any third-party protocol implementation. The panel's live view is
the client's own framebuffer, so you can log in by scanning a QR code and watch
what it does.

## How it works

The assistant is one long-running agent with a single session per account,
working one turn at a time. Its working memory is a rotating context window with
a token budget: as the window fills, the stack sends staged reminders that ask
the assistant to write notes and prepare a handoff, and at the limit the window
rolls over to a fresh one. Notes are the long-term memory - each carries a short
summary and a share of the token budget, and the stack keeps an active set of
them in every new window, which also opens with the previous window's handoff
and the chat's recent messages while the full history stays searchable. A small
second model, the fast judge, reads a bounded slice of the recent conversation
when it decides things like when to answer and whether to quote; it never writes
the replies.

More detail, and how the context handling compares with AstrBot, MaiBot,
DeepSeek Harness and pi: [docs/how-it-works.md](docs/how-it-works.md).

## Requirements

- Linux x86_64, or macOS/Windows with a Linux VM.
- Docker 24+ or Podman 4+ with `compose`.
- About 2 GB of RAM and 5 GB of disk for the images and the client's profile.
- A secondary account on the chat backend, not a fresh one.
- A model provider API key (Anthropic, OpenAI, OpenRouter, or anything pi
  supports) for the assistant. The rest of the stack runs without it.

## Quick start

```sh
git clone https://github.com/4fuu/personal-bot.git
cd personal-bot
cp .env.example .env
```

Edit `.env`: set `CONSOLE_PASSWORD`, generate the three tokens with
`openssl rand -hex 32`, and pick one of the two QQ sources (see
[First start](#first-start)).

```sh
mkdir -p data/driver/secrets data/bot/pi data/bot/secrets workspace logs
sudo chown -R 1000:1000 data/bot workspace logs
docker compose up -d
```

Then open <http://localhost:8080>, sign in with `CONSOLE_PASSWORD`, and scan the
QR code in the live view with the phone app. Tick 自动登录 so later restarts
resume on their own. The first login takes a while - the driver reads the
database key out of the client under a debugger, which the runner measured at up
to about 8 minutes on a first boot under the virtual display. The panel's status
line shows `db.key = "ok"` when it is done.

Rootless Podman: run `podman unshare chown -R 1000:1000 data/bot workspace logs`
once after the directories exist, instead of the `sudo chown` above.

## First start

QQ is not inside any image. The `qq` container installs the pinned build on its
first start, from **exactly one** of two sources:

| Source | How to give it |
| --- | --- |
| A download URL | `QQ_DEB_URL=https://example.com/QQ_3.2.34_260924_amd64_01.deb` in `.env` |
| A deb you already have | mount it at `/qq/QQ.deb` in `compose.yaml` (two lines to uncomment) and leave `QQ_DEB_URL` empty |

Whichever you choose, the container verifies the file's sha256 against the pin
baked into the image and **refuses to install anything else**, with an error that
names the version it expected. The install lands in the `qq_install` volume, so
later starts skip it. If you give neither source, or both, the container says so
and prints both options rather than guessing.

> The official download URL answers `403` without a signature. Download the file
> from a mirror, check its sha256 yourself, and either serve it locally
> (`python3 -m http.server` plus `QQ_DEB_URL=http://127.0.0.1:8000/<file>` and
> `network_mode: host` for the build step) or mount it as a file.

## Configuration

See [.env.example](.env.example), a plain env file whose comments explain every
variable. The short version:

| Variable | What it is |
| --- | --- |
| `CONSOLE_PASSWORD` | the panel's password, the only thing in front of it |
| `DRIVER_TOKEN`, `BOT_TOKEN`, `SANDBOX_EXEC_TOKEN` | the three internal tokens; `openssl rand -hex 32` |
| `QQ_DEB_URL` | one of the two QQ sources |
| `PI_OFFLINE` | `1` disables pi's model-catalog fetch |
| `PERSONAL_BOT_TAG` | the image tag to run; empty means `latest` (the newest release), and a tag such as `v2026.1025.0` pins one |

The assistant's own settings - which model, who may talk to it, what it may
remember, which domains its commands may reach - all live in the console, not in
the environment.

## Where the data lives

| Host path | Mounted at | Holds |
| --- | --- | --- |
| `./data/driver` | `/data/driver` | `secrets/db_key` (0600), `mirror.db`, `config.json` |
| `./data/bot` | `/data/bot` | `bot.db`, `pi/` (`auth.json` 0600), `secrets/`, `stickers/` |
| `./workspace` | `/workspace` | the agent's files and the full copies of truncated output |
| `./logs` | `/out` | the `qq` container's own logs: `qq.log`, `keyx.log`, `novnc.log` |
| `qq_profile` (volume) | `/home/qq/.config/QQ` | the client's profile: login state, databases, image cache |
| `qq_install` (volume) | `/opt/QQ` | the installed client build |

The workspace is shared by the bot and the sandbox and by nothing else. The
sandbox has no other mount, so it cannot read the mirror, `bot.db` or the
client's files, and its only route to the internet is the bot's egress proxy:
the sandbox sits on an internal compose network (`sandbox_net`) that has no
route out of the stack, and the bot is the only other service on it.

The files under `./logs` are diagnostics the stack writes while it runs, and
they may contain chat content, so keep them private and do not share them.

## Updating

```sh
docker compose pull
docker compose up -d
```

Data survives. The client's profile and its install are both volumes, so a
recreate loses nothing.

## Connecting an MCP client

The assistant can act as an MCP client, and an MCP server that authenticates over
OAuth can register it by **Client ID Metadata Document**: the `client_id` is the
URL of a JSON document, and the authorization server fetches it to learn the
client's redirect URIs and its name.

This repository ships that document as [`mcp-client.json`](mcp-client.json), with
`client_id` set to the GitHub Pages URL it is served from:

```json
{
  "client_id": "https://4fuu.github.io/personal-bot/mcp-client.json",
  "redirect_uris": ["http://localhost:8080/mcp/oauth/callback"]
}
```

**Assumption:** you reach the console at `http://localhost:8080`, so the browser's
callback address is `http://localhost:8080/mcp/oauth/callback`, and the document
is hosted at `https://4fuu.github.io/personal-bot/mcp-client.json`. If you reach
the console at another address - a domain, a tunnel, another port - edit
`redirect_uris` in your copy to match it exactly, because the authorization
server refuses a callback that does not match the address the browser used.

To serve the document from GitHub Pages, copy `mcp-client.json` to the root of a
GitHub Pages site for this repository. If you would rather not publish anything,
register the client by hand on the MCP server instead, or use its dynamic client
registration if it has one; both are options in the console's 工作区 page.

## Troubleshooting

| Symptom | What it means |
| --- | --- |
| `error: no QQ source: set exactly one of ...` | neither `QQ_DEB_URL` nor a mounted deb was given; see [First start](#first-start) |
| `error: sha256 mismatch: expected ... got ...` | the deb is not the pinned build; get the right file |
| `error: both QQ_DEB_URL and the mounted deb ... are set` | remove one of the two |
| The live view stays on the QR code | that is correct: a QR login is manual and yours to do |
| `db.key = "missing"` | the key extraction has not finished; the log is `./logs/keyx.log` on the host (`/out/keyx.log` inside the container). The driver keeps watching, so the status turns to `"ok"` on its own once the key lands |
| The panel's pages answer 502 | the driver or the bot is not up yet; check `docker compose logs qq bot` |

## License

[LICENSE](LICENSE). Free to run for yourself; no redistribution or resale of the
images; no warranty; your account and your data are your risk.

## Disclaimer

[DISCLAIMER.md](DISCLAIMER.md). Not affiliated with Tencent or with QQ, provided
as is, and not to be used for illegal purposes.
