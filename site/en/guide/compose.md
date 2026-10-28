# compose and data volumes

`compose.yaml` defines the four services that make up a single-account stack.
Only the console's port `8080` is published to the host; all other service ports
stay on the internal Docker networks.

| Service | Role |
| --- | --- |
| `qq` | Runs the official, unmodified desktop client on a virtual display alongside the driver. Grants `SYS_PTRACE` solely so `gdb` can extract the database key on first login |
| `console` | Web admin panel. The only published service; fronts the driver API, bot API, and live VNC view behind a single password |
| `bot` | Assistant service: runs the single-account agent session, manages notes memory, and reviews every outbound message |
| `sandbox` | Command sandbox: runs an execution server that drops every command to an unprivileged user, mounts only the shared workspace, and holds no credentials |

## Persistent data layout

| Host path / volume | Container path | Contents |
| --- | --- | --- |
| `./data/driver` | `/data/driver` | Extracted database key (`secrets/db_key`, mode `0600`), decrypted SQLite mirror (`mirror.db`), driver config (`config.json`) |
| `./data/bot` | `/data/bot` | Agent database (`bot.db`), model provider credentials (`pi/auth.json`, mode `0600`), secret store (`secrets/`), sticker files (`stickers/`) |
| `./workspace` | `/workspace` | Agent files, installed skills, staged chat attachments, and full copies of truncated tool outputs |
| `./logs` | `/out` | Diagnostic logs from the `qq` container: `qq.log`, `keyx.log`, `novnc.log` |
| `qq_profile` (volume) | `/home/qq/.config/QQ` | Client profile: login session, encrypted databases, and media cache |
| `qq_install` (volume) | `/opt/QQ` | Installed client build |

The host directories `./data/bot`, `./workspace`, and `./logs` must be owned by
UID `1000` (see [Quick start](./quick-start)); the two named volumes need no
manual ownership changes.

## Workspace and sandbox isolation

`./workspace` is shared exclusively between `bot` and `sandbox`. Because the
sandbox has no other volume mounts, it cannot read `mirror.db`, `bot.db`, stored
secrets, or client files. On the network side, `sandbox` is attached only to an
internal Compose network (`sandbox_net`) with no external gateway, where `bot`
is the only other peer. Every outbound HTTP(S) request from a sandbox command
must go through the bot's egress proxy, whose allowlist and denylist are managed
in the **网络** card on the [Safety](./console/safety) page.

## Logs and privacy

Files under `./logs` on the host are low-level runtime logs from the `qq`
container and may contain chat text; keep them private and redact personal
details before sharing excerpts. The console's [Logs](./console/logs) page is a
separate structured feed that combines driver actions, bot turn trajectories,
and console events in one filterable view.

## Backups

To back up an instance, copy `./data`, `./workspace`, and the `qq_profile` and
`qq_install` named volumes. Losing `qq_profile` requires scanning a new QR code
and loses local client history; losing `qq_install` simply triggers a clean
reinstall of the pinned client on the next start. For upgrade instructions, see
[Updating](./updating).
