# Console overview

The console is this machine's panel: <http://localhost:8080>, signed in with
`CONSOLE_PASSWORD`, one session cookie, and nothing works before login. It is the
only service meant to be published, and the only one that needs to be.

The left nav has four groups, one topic each - everything about one feature lives
on its own page:

| Group | Pages |
| --- | --- |
| 运行 | 概览, QQ |
| 机器人 | 会话, 人设, 记忆, 表情包, 定时 |
| 设置 | 模型, 安全, 工作区, 高级 |
| — | 日志, 退出登录 |

The status block sits at the top of the nav: QQ login, the database key, the bot
and Jev lights, the window token gauge, and pause / resume.

## 概览: the page to open first

待处理 lists only problems - QQ not logged in, the key not ok, no main model,
Jev missing or unreachable, an empty allow list, an allowed conversation outside
the driver scope, the bot paused, a failed skill update - each with the one
button that fixes it, and it disappears when there is nothing to report. An empty
one is the good state.

Below it: three summary cards (QQ, 机器人, 会话) and 最近动态, the last five turn,
send and join-in entries.

## QQ: connection and live view

The 连接 card is one row per status: whether the client runs, its login state,
version, the database key (ok / missing / invalid, with re-extract steps when it
is not ok), the last sync time and the mirror lag. The 登录 button below is the
manual retry - after a restart the driver clicks it by itself.

实时画面 is the client's own framebuffer, proxied out through the console, so VNC
is never exposed. The QR scan happens here; the screen is drawn at 1:1 framebuffer
pixels inside a frame that scrolls, and 适应窗口 switches to whole-screen
scaling. The size is set by `SCREEN_W` x `SCREEN_H` (see
[Environment variables](../env)).

## How the pages read

The panel is deliberately simple: a personal assistant on a secondary account,
so it has no users, roles or multi-account switching. Each page shows its current
value in one line with the action that changes it, and the form lives in a
popover, modal or drawer rather than a long flat list. Raw ids, refs and
secondary fields sit behind a popover or a 详情 disclosure, always one click away
and copyable.
