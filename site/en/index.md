---
layout: home

hero:
  name: personal-bot
  text: A self-hosted personal assistant
  tagline: Runs on your own machine, stores its memory in files you control, and replies in the chats you already use.
  # Hero image: release/personal-bot/assets/mascot-hero.png in the repository
  # (a web-sized copy of the mascot, transparent PNG). VitePress prepends the
  # base (/personal-bot/), so the path is site-root relative; the deploy
  # workflow copies the repository's assets/ to the site root.
  image: /assets/mascot-hero.png
  actions:
    - theme: brand
      text: Quick start
      link: /en/guide/quick-start
    - theme: alt
      text: How it works
      link: /en/guide/how-it-works

features:
  - title: Read messages
    details: Reads messages from the client's local database without tapping the client's live message stream.
  - title: Send and download media
    details: Sends text, built-in faces, images, stickers, files, @mentions, and quote replies through the client's own send path—paced by a single queue with human-like jitter—and downloads received media on demand.
  - title: Long-term memory
    details: Maintains its own notes with source anchors pointing back to exact messages and turns, alongside a searchable log of every turn and tool call.
  - title: Follow up later
    details: Supports timed waits, six-hour wake words, scheduled tasks configured in an admin's private chat, and optional free turns when chats are quiet.
  - title: Tools and integrations
    details: Includes web search and page reading, shell commands and file editing in an isolated sandbox, JavaScript tool chaining, skills, and MCP servers with per-function switches.
  - title: Web console
    details: Manage the live client screen and login, conversation policies, persona, memory, stickers, schedules, models, safety rules, workspace tools, advanced timing, and live logs.
---


::: warning Read this first
This project drives a third-party desktop client, which violates that client's
terms of service and can get an account restricted or banned. Use a secondary
account with existing history, a residential connection, and the default send
pacing. This is a private research project provided as is; you bear all risk.
Read the [disclaimer](./guide/disclaimer) before running anything.
:::

## Architecture

The stack runs four containers for a single chat account: `qq` runs the official
desktop client on a virtual display, `bot` runs the assistant, `console` serves
the web panel you manage it from, and `sandbox` runs the assistant's shell
commands as an unprivileged user.

<p align="center">
  <img src="../../assets/architecture.svg" alt="Architecture of one stack: the official chat client runs headless and writes its local database; the driver reads that database, serves the console and the bot, and sends messages and downloads media through the client itself; the bot runs its commands in the sandbox" />
</p>

## Start here

- [Quick start](./guide/quick-start): system requirements, cloning, `.env` setup, and starting the stack.
- [First start and QR login](./guide/first-start): providing the QQ package, database key extraction, and scanning the QR code.
- [Environment variables (.env)](./guide/env): reference for every setting in `.env`.
- [Console guide](./guide/console/): walkthrough of every page in the web panel.
- [MCP client (OAuth)](./guide/mcp): connecting the assistant to OAuth 2.1 MCP servers.

## Works with every model [pi](https://pi.dev) supports

The assistant is built on [pi](https://pi.dev), so every model provider and
vision-capable model supported by pi is available out of the box. Sign in to a
provider or add an API key on the console's [Models and Jev](./guide/console/models)
page. The model catalog is fetched at startup and refreshed once a day
automatically (unless `PI_OFFLINE=1`), and can be refreshed on demand from the
page header without restarting any container.

For the full repository overview, see the
[README](https://github.com/4fuu/personal-bot); for the details of context
windows, memory, and comparisons with other frameworks, see
[docs/how-it-works.md](https://github.com/4fuu/personal-bot/blob/main/docs/how-it-works.md).

<!--
  Console screenshots may only be taken from apps/console's mock mode
  (synthetic data) and belong under public/.
-->
