# compose 与数据卷

`compose.yaml` 描述四个服务，一个 stack 对应一个账号。除控制台的 8080 之外没有别的端口
需要发布。

| 服务 | 是什么 |
| --- | --- |
| `qq` | 聊天客户端（官方、未修改、无头运行）加驱动程序。持有 ptrace 权能，只为首次登录读一次数据库密钥 |
| `console` | 面板。唯一打算发布的服务，一个密码背后同时代理驱动程序 API 和实时画面 |
| `bot` | 模型：一个 agent 会话、笔记记忆，以及每条出站消息的审查 |
| `sandbox` | 模型的命令所在的沙箱：一个 exec 服务，每条命令都落到非特权用户，只有一个卷，自己不持任何密钥 |

## 数据放在哪里

| 宿主机路径 | 挂载到 | 内容 |
| --- | --- | --- |
| `./data/driver` | `/data/driver` | `secrets/db_key`（0600）、`mirror.db`、`config.json` |
| `./data/bot` | `/data/bot` | `bot.db`、`pi/`（`auth.json` 0600）、`secrets/`、`stickers/` |
| `./workspace` | `/workspace` | 模型的文件，以及被截断输出的完整副本 |
| `./logs` | `/out` | `qq` 容器自己的日志：`qq.log`、`keyx.log`、`novnc.log` |
| `qq_profile`（卷） | `/home/qq/.config/QQ` | 客户端配置：登录态、数据库、图片缓存 |
| `qq_install`（卷） | `/opt/QQ` | 已安装的客户端版本 |

`./data/bot`、`./workspace` 和 `./logs` 要归 uid 1000（见 [快速开始](./quick-start)）；
两个命名卷不需要。

## 工作区与沙箱

`./workspace` 只由 bot 和 sandbox 共享，没有第三个使用者。沙箱没有别的挂载，
所以它读不到镜像副本、`bot.db` 和客户端的文件；它通往互联网的唯一出口是 bot 的出网代理：
沙箱在一个没有出栈路由的内部 compose 网络上，同一个网络上只有 bot。代理放行哪些域名，
在 [安全](./console/safety) 页的 网络 卡片里审。

## 日志可能含聊天内容

`./logs` 下的文件是整套栈运行时写下的诊断日志，可能包含聊天内容，请妥善保管，不要分享。
面板里的 [日志](./console/logs) 页是另一份：它汇总驱动、机器人和面板自己的事件，
可以直接在面板里筛。

## 更新与备份

备份就是复制 `./data`、`./workspace` 和两个命名卷；客户端配置（`qq_profile`）丢了要重新扫码，
`qq_install` 丢了下次启动重装。更新步骤见 [更新](./updating)。
