# Quick start

This page takes an empty machine to "the panel opens and the QR code can be
scanned". The first-start details (where QQ comes from, how the key is read) are
on [First start and QR login](./first-start).

## Requirements

- Linux x86_64, or macOS / Windows with a Linux VM.
- Docker 24+ or Podman 4+ with `compose`.
- About 2 GB of RAM and 5 GB of disk for the images and the client's profile.
- A secondary account on the chat backend, not a fresh one.
- A model provider API key (Anthropic, OpenAI, OpenRouter, or anything pi
  supports) for the assistant. The rest of the stack runs without it.

## Four steps up

```sh
git clone https://github.com/4fuu/personal-bot.git
cd personal-bot
cp .env.example .env
```

Edit `.env`: set `CONSOLE_PASSWORD`, generate the three tokens with
`openssl rand -hex 32`, and pick one of the two QQ sources (see
[First start](./first-start)). What every variable means is on
[Environment variables](./env).

```sh
mkdir -p data/driver/secrets data/bot/pi data/bot/secrets workspace logs
sudo chown -R 1000:1000 data/bot workspace logs
docker compose up -d
```

Then open <http://localhost:8080>, sign in with `CONSOLE_PASSWORD`, and scan the
QR code in the live view with the phone app. Tick 自动登录 so later restarts
resume on their own.

::: tip Rootless Podman
Run `podman unshare chown -R 1000:1000 data/bot workspace logs` once after the
directories exist, instead of the `sudo chown` above.
:::

## The first login takes a while

On first login the driver reads the database key out of the client under a
debugger: up to about 8 minutes measured on a first boot under the virtual
display. The panel's status line shows `db.key = "ok"` when it is done; before
that the panel's bot pages may still error, which is normal. The wait is bounded
by `KEYX_TIMEOUT_S` (900 seconds by default) and a timeout is not fatal - the
driver keeps watching, and the status turns to `"ok"` on its own once the key
lands.

## Next

- Make it talk: set at least one conversation to 参与 in
  [Conversations](./console/conversations) and add an admin in
  [Safety](./console/safety) - it starts no turn until both exist.
- Give it a model: log a provider in and pick the main model on
  [Models](./console/models).
- Let it know you: write who it is and how it talks on
  [Persona](./console/persona).
