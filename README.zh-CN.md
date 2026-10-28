# personal-bot（中文）

<div align="center">

**一个跑在你自己机器上的个人助理：记忆存在你自己拥有的文件里，在你已经在用的聊天软件里回复你。**

[快速开始](#快速开始) · [首次启动](#首次启动) · [配置](#配置) · [能做什么](#能做什么) · [它是怎么工作的](#它是怎么工作的) · [免责声明](#免责声明)

</div>

> **警告。** 本项目会驱动一个第三方桌面客户端，这不在该客户端服务条款允许的范围内，
> 账号可能被限制或封禁。请使用有小号历史记录的账号、家庭宽带，并保留默认的发送节奏。
> 私人研究项目，按"现状"提供，全部风险由使用者承担。
> 运行前请先阅读 [DISCLAIMER.md](DISCLAIMER.md)。

---

## 这是什么

四个容器。其中一个在虚拟显示里运行聊天客户端；另外三个分别是模型、你用来操作它的面板，
以及模型的命令所在的沙箱。

```
┌──────────────────────────── 一个 stack = 一个账号 ────────────────────────────┐
│                                                                                │
│  聊天客户端（官方、未修改、无头运行）                                            │
│    │ 写入              ▲ 发送              ▲ 点击 登录                          │
│    ▼                   │                   │                                   │
│  私有的解密副本 ────────▶ driver API（HTTP + WebSocket）                        │
│                            │                        │                          │
│                            ▼                        ▼                          │
│                        console :8080              bot :8766                    │
│                        （面板、实时画面）          （模型、笔记、发送审核）        │
│                                                      │                         │
│                                                      ▼                         │
│                                                  sandbox :8791                 │
│                                                  （每条命令都以非特权用户运行）  │
└────────────────────────────────────────────────────────────────────────────────┘
```

- **读。** 收到的消息会在几秒内出现在客户端自己的本地数据库里。本项目解密的是它的
  **一份私有副本**，因此能拿到真实的消息 id、发送者、@提及、引用回复和图片文件，
  而不需要接触客户端进程。
- **写。** 文本、图片、表情、@提及和引用回复都走客户端自己的发送函数，由一个带人类抖动
  的动作队列控制节奏。
- **与客户端进程的接触。** 首次登录时的一个 `gdb` 断点，用于读取数据库密钥（之后重启
  依然有效），以及一个在启动时被预加载进客户端的小型库，由它承接发送。客户端自身的文件
  不被补丁、不被替换、也不被写入。

### 后端说明

聊天后端是 **官方的 Linux 版 QQ NT 桌面客户端**，即发布说明中记录的那个固定版本，
在 `qq` 容器内以 TigerVNC 显示、未经修改地运行。模型对你聊天的全部了解，都来自这个
客户端自己数据库的一份解密副本；它发出的每一条消息，也都走这个客户端自己的发送路径。

本项目不读取客户端的事件流，不监视它的进程，也不使用任何第三方协议实现。面板里的实时
画面就是客户端自己的 framebuffer，所以你可以扫码登录，并看着它做事。

## 能做什么

- **聊天。** 回复私聊和 @；在你允许的群里，也可以自己插话。每个会话在面板里有各自的策略。
- **发送。** 文字（可带客户端自带的小黄脸）、表情包（看到喜欢的会自己收藏）、图片和文件，
  支持引用回复和 @。
- **读取。** 聊天记录与搜索、图片、聊天里发的文件、语音和合并转发。
- **记忆。** 它自己写的笔记，以及可检索的自身历史。
- **过一阵再来。** `wait`（一分钟到一天）、唤醒词、在管理员私聊里设定的定时任务，
  以及可选的空闲轮：一段时间没有任何动静时，给它一轮自由活动的时间。
- **用工具。** 网页搜索和网页阅读；沙箱里的命令行和文件，沙箱只能经过一个过滤代理出网；
  `code_exec` 脚本、技能，以及 MCP 服务端——每个函数都能在面板里单独开关。
- **面板。** 实时画面与登录、会话与策略、人设、记忆、表情包、定时、模型、安全、
  工作区（MCP、技能、环境变量）、高级设置和日志。

## 它是怎么工作的

模型是一个长期运行的 agent，每个账号一个会话，一次只处理一轮。一轮由一批消息、唤醒词、
到点的 `wait`、定时任务或空闲轮开启；消息会先短暂合并成批，在群里由一个小模型 Jev
判断现在插话是否自然；轮中来的新消息会交给正在进行的这一轮。它的工作记忆是一个带
token 预算的滚动上下文窗口：窗口将满时，栈会分阶段发送提醒，让模型写笔记并准备交接
（话题、进展、待办、约定）；到达上限后，窗口滚动切换到一个新窗口。笔记就是长期记忆——
每条都带一段简短摘要和一份 token 预算，栈会在每个新窗口里保留一组活跃笔记；新窗口还会
带上旧窗口的交接内容和当前会话的最近消息，而完整历史始终可以检索。Jev 从不撰写回复内容，只回答是非题：要不要插话、何时回复、要不要引用、气泡能不能发出。

更多细节，以及上下文机制与 AstrBot、MaiBot、DeepSeek Harness、pi 的对比：
[docs/how-it-works.zh-CN.md](docs/how-it-works.zh-CN.md)。

## 环境要求

- Linux x86_64，或在 Linux 虚拟机里运行的 macOS / Windows。
- Docker 24+ 或 Podman 4+，带 `compose`。
- 约 2 GB 内存、5 GB 磁盘，用于镜像和客户端配置。
- 聊天后端的一个小号，不要用新号。
- 一个模型服务商的 API key（Anthropic、OpenAI、OpenRouter，或 pi 支持的任何一家），
  供模型使用。其余部分没有它也能跑。

## 快速开始

```sh
git clone https://github.com/4fuu/personal-bot.git
cd personal-bot
cp .env.example .env
```

编辑 `.env`：设置 `CONSOLE_PASSWORD`，用 `openssl rand -hex 32` 生成三个令牌，
并选择一种 QQ 来源（见[首次启动](#首次启动)）。

```sh
mkdir -p data/driver/secrets data/bot/pi data/bot/secrets workspace logs
sudo chown -R 1000:1000 data/bot workspace logs
docker compose up -d
```

然后打开 <http://localhost:8080>，用 `CONSOLE_PASSWORD> 登录，在实时画面里用手机 App
扫码。勾选 自动登录，之后重启就能自己恢复。首次登录会比较久——驱动程序要在调试器里
从客户端读出数据库密钥，在虚拟显示下首次启动实测最多约 8 分钟。面板状态行显示
`db.key = "ok"` 时即完成。

Rootless Podman：目录建好后执行一次
`podman unshare chown -R 1000:1000 data/bot workspace logs`，代替上面的 `sudo chown`。

## 首次启动

任何镜像里都不包含 QQ。`qq` 容器在首次启动时安装固定版本，来源必须是下面两者中的
**恰好一个**：

| 来源 | 怎么给 |
| --- | --- |
| 一个下载地址 | `.env` 里设置 `QQ_DEB_URL=https://example.com/QQ_3.2.34_260924_amd64_01.deb` |
| 一个你已经下载好的 deb | 在 `compose.yaml` 里把它挂载到 `/qq/QQ.deb`（取消两行注释），`QQ_DEB_URL` 留空 |

无论选哪一种，容器都会先校验文件的 sha256 与镜像内置的固定值是否一致，
**不一致就拒绝安装**，并报出它期望的版本号。安装结果落在 `qq_install` 卷里，
之后的启动会跳过安装。如果两个来源都没给、或者都给了，容器会说明情况并打印两种
正确的给法，而不是去猜。

> 官方下载地址在没有签名的情况下会返回 `403`。请从镜像站下载文件，自己核对 sha256，
> 然后要么本地起一个服务（`python3 -m http.server` 加
> `QQ_DEB_URL=http://127.0.0.1:8000/<文件>`），要么直接挂载文件。

## 配置

见 [.env.example](.env.example)，一个纯 env 文件，每个变量都有注释说明。简要说明：

| 变量 | 含义 |
| --- | --- |
| `CONSOLE_PASSWORD` | 面板密码，面板前面唯一的一道门 |
| `DRIVER_TOKEN`、`BOT_TOKEN`、`SANDBOX_EXEC_TOKEN` | 三个内部令牌，用 `openssl rand -hex 32` 生成 |
| `QQ_DEB_URL` | 两种 QQ 来源之一 |
| `PI_OFFLINE` | `1` 关闭 pi 的模型目录拉取 |
| `PERSONAL_BOT_TAG` | 要运行的镜像 tag，留空为 `latest`（最新发布）；设为 `v2026.1025.0` 这样的 tag 即可固定版本 |

模型自己的设置——用哪个模型、谁可以跟它说话、它能记住什么、它的命令可以访问哪些
域名——都在面板里，不在环境变量里。

## 数据放在哪里

| 宿主机路径 | 挂载到 | 内容 |
| --- | --- | --- |
| `./data/driver` | `/data/driver` | `secrets/db_key`（0600）、`mirror.db`、`config.json` |
| `./data/bot` | `/data/bot` | `bot.db`、`pi/`（`auth.json` 0600）、`secrets/`、`stickers/` |
| `./workspace` | `/workspace` | 模型的文件，以及被截断输出的完整副本 |
| `./logs` | `/out` | `qq` 容器自己的日志：`qq.log`、`keyx.log`、`novnc.log` |
| `qq_profile`（卷） | `/home/qq/.config/QQ` | 客户端配置：登录态、数据库、图片缓存 |
| `qq_install`（卷） | `/opt/QQ` | 已安装的客户端版本 |

workspace 只由 bot 和 sandbox 共享，没有第三个使用者。沙箱没有别的挂载，
因此它读不到 mirror、`bot.db` 和客户端的文件，而它通往互联网的唯一出口是 bot 的
出网代理：沙箱位于一个没有出栈路由的内部 compose 网络（`sandbox_net`）上，
同一个网络上只有 bot。

`./logs` 下的文件是整套栈运行时写下的诊断日志，可能包含聊天内容，
请妥善保管，不要分享。

## 更新

```sh
docker compose pull
docker compose up -d
```

数据不会丢。客户端配置和它的安装都是卷，重建容器不损失任何东西。

## 接入 MCP 客户端

模型可以作为 MCP 客户端，而一个用 OAuth 认证的 MCP 服务端可以通过
**Client ID Metadata Document** 注册它：`client_id` 是一个 JSON 文档的 URL，
授权服务器会去取这个文档，从而知道客户端的跳转地址和名字。`client_id` 必须
与文档被取用时的 URL 完全一致，所以一份文档只能对应一个面板地址。

**按来源分发文档的 Worker。** `cimd-worker/` 里有一个 Cloudflare Worker，它从
路径里读出面板的地址：

```
https://personal-bot-cimd.immeasurable-o.workers.dev/http/localhost:8080/mcp-client.json
```

就是面板在 `http://localhost:8080` 时的那份文档：

```json
{
  "client_id": "https://personal-bot-cimd.immeasurable-o.workers.dev/http/localhost:8080/mcp-client.json",
  "redirect_uris": ["http://localhost:8080/mcp/oauth/callback"]
}
```

URL 按你打开面板时用的地址拼：协议、主机和端口，再接 `/mcp-client.json`。
回环地址（`http://localhost:<端口>`、`http://127.0.0.1:<端口>`、
`http://[::1]:<端口>`，以及本地 TLS 反代下同样的 `https` 形式）不需要任何设置
就能用；其他主机必须写进 Worker 的 `CIMD_EXTRA_HOSTS` 变量，否则别人就能拿到一份
把授权跳转到他自己地址的文档。不想依赖上面这个 Worker，就自己部署一个：

```sh
cd cimd-worker
CLOUDFLARE_API_TOKEN=<有部署 Worker 权限的 token> npx wrangler deploy
```

要放行一个非回环主机，把它写进 `wrangler.toml` 的 `[vars]`
（`CIMD_EXTRA_HOSTS = "console.example.com"`：逗号分隔的主机名，不带协议和
端口），再部署一次。

**静态文件是后备方案。** 本仓库把这份文档放在
[`mcp-client.json`](mcp-client.json)，`client_id` 指向它所在的 GitHub Pages
地址：

```json
{
  "client_id": "https://4fuu.github.io/personal-bot/mcp-client.json",
  "redirect_uris": ["http://localhost:8080/mcp/oauth/callback"]
}
```

**假设：** 你通过 `http://localhost:8080` 访问面板，因此浏览器的回调地址是
`http://localhost:8080/mcp/oauth/callback`，而文档托管在
`https://4fuu.github.io/personal-bot/mcp-client.json`。如果你用别的地址访问面板——
域名、隧道、其他端口——请把 `redirect_uris` 改成与浏览器实际使用的地址完全一致，
因为授权服务器会拒绝不一致的回调地址。

要用 GitHub Pages 提供这份文档，把 `mcp-client.json` 复制到本仓库的 GitHub Pages
站点根目录即可。如果你不想公开发布任何东西，也可以改在 MCP 服务端上手工注册这个
客户端，或者用它自己的动态客户端注册；这两个选项都在面板的 工作区 页面里。

## 排障

| 现象 | 含义 |
| --- | --- |
| `error: no QQ source: set exactly one of ...` | `QQ_DEB_URL` 和挂载的 deb 都没给，见[首次启动](#首次启动) |
| `error: sha256 mismatch: expected ... got ...` | 这个 deb 不是固定版本，换一个文件 |
| `error: both QQ_DEB_URL and the mounted deb ... are set` | 去掉其中一个 |
| 实时画面一直停在二维码 | 这是正常的：扫码登录是手动的，由你完成 |
| `db.key = "missing"` | 密钥提取还没完成，日志在宿主机的 `./logs/keyx.log`（容器内是 `/out/keyx.log`）；驱动程序会继续等待，密钥就绪后状态自己变成 `"ok"` |
| 面板页面返回 502 | driver 或 bot 还没起来，看 `docker compose logs qq bot` |

## 许可

[LICENSE](LICENSE)。可以自己运行；不得再分发或转售镜像；不提供任何担保；
账号与数据的风险由你自己承担。

## 免责声明

[DISCLAIMER.md](DISCLAIMER.md)。与腾讯、与 QQ 无任何关系，按"现状"提供，
不得用于违法用途。
