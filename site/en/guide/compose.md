# compose and data volumes

`compose.yaml` describes four services; one stack is one account. No port needs
publishing except the console's 8080.

| Service | What it is |
| --- | --- |
| `qq` | the chat client (official, unmodified, headless) plus the driver. It holds the ptrace capability for the one key read at first login and nothing else |
| `console` | the panel. The only service meant to be published; behind one password it fronts the driver API and the live view |
| `bot` | the assistant: one agent session, notes memory, and a review pass over every outbound message |
| `sandbox` | where the assistant's commands run: an exec server that drops every command to an unprivileged user, one volume, no secret of its own |

## Where the data lives

| Host path | Mounted at | Holds |
| --- | --- | --- |
| `./data/driver` | `/data/driver` | `secrets/db_key` (0600), `mirror.db`, `config.json` |
| `./data/bot` | `/data/bot` | `bot.db`, `pi/` (`auth.json` 0600), `secrets/`, `stickers/` |
| `./workspace` | `/workspace` | the agent's files and the full copies of truncated output |
| `./logs` | `/out` | the `qq` container's own logs: `qq.log`, `keyx.log`, `novnc.log` |
| `qq_profile` (volume) | `/home/qq/.config/QQ` | the client's profile: login state, databases, image cache |
| `qq_install` (volume) | `/opt/QQ` | the installed client build |

`./data/bot`, `./workspace` and `./logs` belong to uid 1000 (see
[Quick start](./quick-start)); the two named volumes need nothing.

## The workspace and the sandbox

`./workspace` is shared by the bot and the sandbox and by nothing else. The
sandbox has no other mount, so it cannot read the mirror, `bot.db` or the
client's files, and its only route to the internet is the bot's egress proxy:
the sandbox sits on an internal compose network that has no route out of the
stack, and the bot is the only other service on it. Which domains the proxy
allows is reviewed in the 网络 card on the [Safety](./console/safety) page.

## The logs may contain chat content

The files under `./logs` are diagnostics the stack writes while it runs, and they
may contain chat content, so keep them private and do not share them. The panel's
[Logs](./console/logs) page is a different thing: it folds the driver's, the
bot's and the panel's own events into one filterable feed.

## Backups

Backing up is copying `./data`, `./workspace` and the two named volumes. Losing
the client's profile (`qq_profile`) costs a new QR scan; losing `qq_install`
costs one reinstall on the next start. The update steps are on
[Updating](./updating).
