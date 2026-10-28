# Console overview

The web console runs at <http://localhost:8080>. Signing in with
`CONSOLE_PASSWORD` sets a session cookie required by every API route and
WebSocket stream. It is the only service in the stack meant to be published.

The left sidebar organizes pages into three main groups (plus **日志** and
**退出登录** at the bottom), keeping each feature's switches, thresholds, and
recent decision logs together on one page:

| Group | Pages |
| --- | --- |
| 运行 (Runtime) | 概览 (Overview), QQ |
| 机器人 (Assistant) | 会话 (Conversations), 人设 (Persona), 记忆 (Memory), 表情包 (Stickers), 定时 (Schedules) |
| 设置 (Settings) | 模型 (Models), 安全 (Safety), 工作区 (Workspace), 高级 (Advanced) |
| — | 日志 (Logs), 退出登录 (Log out) |

At the top of the sidebar, a persistent status block displays four status
indicators (**QQ 登录**, **DB 密钥**, **机器人**, and **Jev**), the current
context window's token usage bar, and **暂停** / **恢复** buttons.

## 概览 (Overview): the home screen

The **待处理** card at the top of the page appears only when something needs
attention—QQ not signed in, database key missing or invalid, no system admin
configured, no main model selected, Jev missing a key or unreachable, an empty
conversation allowlist, an allowed conversation outside the driver's read
scope, the bot paused, or a failed skill-source update. Each row includes a
button that jumps straight to the relevant page or resumes the bot; once
everything is healthy, the card disappears.

Below it sit three summary cards (**QQ**, **机器人**, and **会话**) and
**最近动态**, which lists the five most recent turns, sends, and Jev decisions.
The **立即轮换** button in the page header lets you request a context-window
rollover at the next turn boundary after entering a reason.

## QQ: connection status and live screen

The **连接** card shows whether the client is running, its login state, the
client version, the database key status (**正常** / **缺失** / **失效**, with
re-extraction commands shown in a banner when not **正常**), the last sync
timestamp, and the database mirror lag. The **登录** button in the card header
manually triggers the login click when the client is on its saved-account
screen (after a restart, the driver also clicks it once automatically).

The **实时画面** card streams the client's virtual framebuffer through the
console's authenticated WebSocket proxy, so VNC is never exposed on a separate
port. You scan the initial login QR code here. By default, the canvas renders
at 1:1 framebuffer pixels inside a scrollable frame; **适应窗口** switches to
fit-to-window scaling. The framebuffer dimensions are set by `SCREEN_W` ×
`SCREEN_H` in `compose.yaml` (see [Environment variables (.env)](../env)).

## Layout conventions

Because the console manages a single personal assistant account, it has no
multi-user accounts, roles, or account switchers. Settings pages show each
option's current value on a single line and open a popover, drawer, or modal
when you edit it, rather than rendering long flat forms. Raw IDs, message
references (`ref`), and secondary metadata stay tucked inside popovers or
**详情** disclosures where they can be copied in one click.
