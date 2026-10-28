# 快速开始

本页介绍如何在一台空机器上完成部署、打开管理面板并扫码登录。关于安装包校验与数据库密钥提取的细节，请参阅[首次启动与扫码登录](./first-start)。

## 环境要求

- Linux x86_64，或运行 Linux 虚拟机的 macOS / Windows。
- Docker 24+ 或 Podman 4+（含 `compose`）。
- 约 2 GB 内存、5 GB 磁盘空间（用于存放容器镜像和客户端配置数据）。
- 一个已有正常使用记录的 QQ 小号（切勿使用新注册账号）。
- [pi](https://pi.dev) 支持的任意视觉模型服务商账号或 API key（如 Anthropic、OpenAI、OpenRouter、DeepSeek 等），以及用于外发审查与判断的 [Jev](https://typesafe.ai/) API key。

## 四步启动

```sh
git clone https://github.com/4fuu/personal-bot.git
cd personal-bot
cp .env.example .env
```

编辑 `.env`：设置面板登录密码 `CONSOLE_PASSWORD`，用 `openssl rand -hex 32` 生成三个内部令牌，并配置一种 QQ 安装包来源（见[首次启动与扫码登录](./first-start)）。各变量的完整说明见[环境变量（.env）](./env)。

```sh
mkdir -p data/driver/secrets data/bot/pi data/bot/secrets workspace logs
sudo chown -R 1000:1000 data/bot workspace logs
docker compose up -d
```

打开 <http://localhost:8080>，使用 `CONSOLE_PASSWORD` 登录面板，进入 **QQ** 页面，在实时画面中用手机 QQ 扫码登录。勾选**自动登录**，后续重启容器即可自动恢复登录。

::: tip Rootless Podman
若使用 Rootless Podman，请在创建目录后执行一次 `podman unshare chown -R 1000:1000 data/bot workspace logs`，代替上面的 `sudo chown`。
:::

## 首次登录需要等待密钥提取

首次扫码登录时，驱动服务会在调试器下从客户端进程提取本地数据库密钥，在虚拟屏幕环境下实测最多约需 8 分钟。在此期间，左侧状态栏的 **DB 密钥** 会显示 **密钥缺失**；提取完成后会自动变为 **密钥正常**。首次启动等待时长由 `KEYX_TIMEOUT_S` 控制（默认 `900` 秒），即使超时也不会中断服务，驱动会在后台继续等待密钥生成。

## 后续配置

- **配置管理员与参与会话：** 在[安全](./console/safety)页面添加至少一位系统管理员，并在[会话与策略](./console/conversations)页面将至少一个会话的状态设为 **参与**——这两项未完成前，模型不会开始任何轮次。
- **选择主模型并配置 Jev：** 在[模型与 Jev](./console/models)页面登录模型服务商、选定支持视觉输入的主模型，并填入 Jev API key。
- **编写人设：** 在[人设](./console/persona)页面填写昵称、性格和说话风格。
