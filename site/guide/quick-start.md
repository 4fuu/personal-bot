# 快速开始

这一页把一个空机器带到"面板能打开、二维码能扫"。首次启动的细节（QQ 从哪来、
密钥怎么读）在 [首次启动与扫码登录](./first-start)。

## 环境要求

- Linux x86_64，或在 Linux 虚拟机里运行的 macOS / Windows。
- Docker 24+ 或 Podman 4+，带 `compose`。
- 约 2 GB 内存、5 GB 磁盘，用于镜像和客户端配置。
- 聊天后端的一个小号，不要用新号。
- 一个模型服务商的 API key（Anthropic、OpenAI、OpenRouter，或 pi 支持的任何一家），
  供模型使用。其余部分没有它也能跑。

## 四步起来

```sh
git clone https://github.com/4fuu/personal-bot.git
cd personal-bot
cp .env.example .env
```

编辑 `.env`：设置 `CONSOLE_PASSWORD`，用 `openssl rand -hex 32` 生成三个令牌，
并选择一种 QQ 来源（见 [首次启动](./first-start)）。每个变量的含义在
[环境变量](./env) 里。

```sh
mkdir -p data/driver/secrets data/bot/pi data/bot/secrets workspace logs
sudo chown -R 1000:1000 data/bot workspace logs
docker compose up -d
```

然后打开 <http://localhost:8080>，用 `CONSOLE_PASSWORD` 登录，在实时画面里用手机 App
扫码。勾选 自动登录，之后重启就能自己恢复。

::: tip Rootless Podman
目录建好后执行一次
`podman unshare chown -R 1000:1000 data/bot workspace logs`，代替上面的 `sudo chown`。
:::

## 第一次登录要等一会儿

首次登录时，驱动程序要在调试器里从客户端读出数据库密钥：虚拟显示下首次启动实测最多
约 8 分钟。面板状态行显示 `db.key = "ok"` 时即完成，在那之前面板的机器人页面可能还在
报错，这是正常的。等待的上限由 `KEYX_TIMEOUT_S` 控制（默认 900 秒），超时不致命——
驱动程序会继续等，密钥就绪后状态自己变成 `"ok"`。

## 接下来

- 让模型开口：在 [会话](./console/conversations) 里把至少一个会话设成 参与，
  并在 [安全](./console/safety) 里加一个管理员——两者齐备之前它不会开始任何一轮。
- 给它一个模型：在 [模型](./console/models) 里登录服务商、选主模型。
- 想让它记住你：在 [人设](./console/persona) 里写它是谁、怎么说话。
