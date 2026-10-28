# Quick start

This guide takes a fresh machine from clone to signing into the web console and
scanning the login QR code. For details on how the QQ package is verified and
how the database key is extracted, see [First start and QR login](./first-start).

## Requirements

- Linux x86_64 (or macOS / Windows running a Linux VM).
- Docker 24+ or Podman 4+ with `compose`.
- Roughly 2 GB of RAM and 5 GB of disk space for the container images and client
  profile.
- A secondary account on the chat platform with some prior history (avoid
  brand-new accounts).
- An account login or API key for any vision-capable model provider supported by
  [pi](https://pi.dev) (Anthropic, OpenAI, OpenRouter, DeepSeek, and others),
  plus a [Jev](https://typesafe.ai/) API key for outbound review and gating.

## Start the stack in four steps

```sh
git clone https://github.com/4fuu/personal-bot.git
cd personal-bot
cp .env.example .env
```

Edit `.env`: set a strong `CONSOLE_PASSWORD`, generate the three internal tokens
with `openssl rand -hex 32`, and configure one of the two QQ package sources
(see [First start and QR login](./first-start)). Every variable is documented on
[Environment variables (.env)](./env).

```sh
mkdir -p data/driver/secrets data/bot/pi data/bot/secrets workspace logs
sudo chown -R 1000:1000 data/bot workspace logs
docker compose up -d
```

Open <http://localhost:8080>, sign in with `CONSOLE_PASSWORD`, go to the **QQ**
page, and scan the QR code in the live view with the mobile QQ app. Check
**自动登录** so later restarts sign back in on their own.

::: tip Rootless Podman
If you use rootless Podman, run
`podman unshare chown -R 1000:1000 data/bot workspace logs` once after creating
the directories instead of `sudo chown`.
:::

## First login and key extraction

On first login, the driver extracts the local database key from the client,
which takes up to about 8 minutes on a virtual display. While
extraction is in progress, **DB 密钥** in the left sidebar shows **密钥缺失**;
once finished, it switches to **密钥正常**. The initial boot wait is controlled by
`KEYX_TIMEOUT_S` (900 seconds by default), and a timeout is non-fatal—the driver
keeps watching in the background and marks the key ready as soon as it lands.

## Next steps

- **Add an admin and allow a conversation:** Add at least one system admin on
  [Safety](./console/safety) and set at least one conversation to **参与** on
  [Conversations and policies](./console/conversations)—the assistant will not
  start any turn until both are configured.
- **Pick a model and set the Jev key:** Sign in to a model provider, choose a
  vision-capable main model, and save your Jev API key on
  [Models and Jev](./console/models).
- **Define the persona:** Fill in the assistant's nickname, personality, and
  speaking style on [Persona](./console/persona).
