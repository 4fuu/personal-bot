---
layout: home

hero:
  name: personal-bot
  text: A self-hosted personal assistant
  tagline: It runs on your own machine, keeps its memory in files you own, and answers in the chats you already use.
  # Header image slot: uncomment this line once
  # release/personal-bot/assets/header.png is in the repository, changing the
  # path if the file lands under another name. The site root's
  # /personal-bot/assets/ is copied from the repository's assets/ by the deploy
  # workflow.
  # image: /personal-bot/assets/header.png
  actions:
    - theme: brand
      text: Quick start
      link: /en/guide/quick-start
    - theme: alt
      text: How it works
      link: /en/guide/how-it-works

features:
  - title: Read
    details: Received messages come from a private, decrypted copy of the client's own database - real message ids, senders, mentions, quotes and images, without touching the client's process.
  - title: Write
    details: Text, images, stickers, @mentions and quote replies go through the client's own send function, paced by one action queue with human-like jitter.
  - title: Remember
    details: Notes the assistant writes itself are its only long-term memory; every turn and tool call lands in a searchable log.
  - title: Come back later
    details: wait, wake words, scheduled tasks, and optional free turns - a turn of its own when nothing has happened for a while.
  - title: Use tools
    details: Web search and page reading, a shell and files in a sandbox, skills and MCP servers - each function switched on or off in the panel.
  - title: Panel
    details: Live view and login, conversations and policies, persona, memory, stickers, schedules, models, safety, workspace, advanced settings and logs - one page per topic.
---

<!-- The header image slot is the commented hero.image in the frontmatter above. -->

::: warning Read this first
This project drives a third-party desktop client, which is outside that client's
terms of service and can get an account restricted or lost. Use a secondary
account, a residential connection and the default pacing. Private research
project, provided as is, and all of the risk is yours. Read the
[disclaimer](./guide/disclaimer) before you run anything.
:::

## What it is

Four containers. One runs a chat client on a virtual display; the other three
are the assistant, the panel you drive it from, and a sandbox the assistant's
commands run in. One stack is one account.

```
┌──────────────────────────── one stack = one account ──────────────────────────┐
│                                                                                  │
│  chat client (official, unmodified, headless)                                    │
│    │ writes              ▲ sends              ▲ clicks 登录                       │
│    ▼                     │                    │                                  │
│  private decrypted copy ──▶ driver API (HTTP + WebSocket)                        │
│                              │                        │                          │
│                              ▼                        ▼                          │
│                          console :8080            bot :8766                      │
│                          (the panel,              (the agent, notes,             │
│                           the live view)           the send review)              │
│                                                      │                           │
│                                                      ▼                           │
│                                                  sandbox :8791                   │
│                                                  (every command, as an           │
│                                                   unprivileged user)             │
└──────────────────────────────────────────────────────────────────────────────────┘
```

## Start here

- [Quick start](./guide/quick-start): requirements, clone, `.env`, `docker compose up -d`.
- [First start and QR login](./guide/first-start): where QQ comes from, how the key is read, who scans the QR code.
- [Environment variables](./guide/env): what every variable in `.env` means.
- [Console](./guide/console/): every page of the panel, one page per topic.
- [MCP client](./guide/mcp): registering this assistant with an OAuth MCP server.

## Models: whatever pi supports

The agent is built on [pi](https://pi.dev), so every provider and model pi supports
is available: log a provider in, or add a key, on the console's
[模型 page](./guide/console/models). The model catalog is fetched at bot start
and refreshed automatically once a day (neither when `PI_OFFLINE=1`), and can be
refreshed on demand, so new models appear without a restart.

The full project write-up is the repository's
[README](https://github.com/4fuu/personal-bot); the context and memory
mechanism is [docs/how-it-works.md](https://github.com/4fuu/personal-bot/blob/main/docs/how-it-works.md).

<!--
  The header image is the commented hero.image in the frontmatter (the file
  comes from the repository's assets/). Console screenshots may only be taken
  from apps/console's mock mode (synthetic data) and belong under public/.
-->
