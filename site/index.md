---
layout: home

hero:
  name: personal-bot
  text: 自托管的个人助理
  tagline: 跑在你自己的机器上，记忆存在你自己拥有的文件里，在你已经在用的聊天软件里回复你。
  # 头图槽位：把 release/personal-bot/assets/header.png 放进仓库后取消下面这行
  # 注释；文件名不同就改这个路径。站点根目录下的 /personal-bot/assets/ 由发布
  # workflow 从仓库的 assets/ 复制而来。
  # image: /personal-bot/assets/header.png
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 它是怎么工作的
      link: /guide/how-it-works

features:
  - title: 读
    details: 收到的消息来自客户端自己数据库的一份私有解密副本，不接触客户端进程，就能拿到真实的消息 id、发送者、@、引用和图片。
  - title: 写
    details: 文字、图片、表情、@和引用回复都走客户端自己的发送函数，由一个带人类抖动的动作队列控制节奏。
  - title: 记
    details: 笔记由模型自己写下，是它唯一的长期记忆；每一轮、每次工具调用都记在可检索的日志里。
  - title: 等
    details: wait、唤醒词、定时任务，以及可选的空闲轮：一段时间没有动静时，它有一轮属于自己的时间。
  - title: 用工具
    details: 网页搜索和阅读、沙箱里的命令行和文件、技能、MCP 服务端——每个函数都能在面板里单独开关。
  - title: 面板
    details: 实时画面与登录、会话与策略、人设、记忆、表情包、定时、模型、安全、工作区、高级设置和日志，一个页面一个主题。
---

<!-- 头图槽位在页面顶部的 frontmatter 里（hero.image，已注释）。 -->

::: warning 先读这一段
本项目驱动一个第三方桌面客户端，这不在该客户端服务条款允许的范围内，账号可能被限制或封禁。
请使用有小号历史记录的账号、家庭宽带，并保留默认的发送节奏。私人研究项目，按"现状"提供，
全部风险由使用者承担。运行前请先读 [免责声明](./guide/disclaimer)。
:::

## 这是什么

四个容器：一个在虚拟显示里运行聊天客户端，另外三个分别是模型、你用来操作它的面板，
以及它的命令所在的沙箱。一个 stack 对应一个账号。

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

## 从这里开始

- [快速开始](./guide/quick-start)：环境要求、clone、`.env`、`docker compose up -d`。
- [首次启动与扫码登录](./guide/first-start)：QQ 从哪来、密钥怎么读、二维码谁扫。
- [环境变量](./guide/env)：`.env` 里每一个变量的含义。
- [控制台](./guide/console/)：面板的每一个页面，一页一个主题。
- [MCP 客户端](./guide/mcp)：让一个用 OAuth 认证的 MCP 服务端注册这个模型。

## 模型：pi 支持的都能用

模型跑在 [pi](https://pi.dev) 上：pi 支持的每一家服务商、每一个模型都能用，
在[控制台](./guide/console/models)的 模型 页登录服务商、或填一个 key 就行。
模型目录在机器人启动时拉取，之后每天自动刷新一次（`PI_OFFLINE=1` 时都不拉取），也可以随时手动刷新，新出的模型不用重启就会出现。

完整的项目说明在仓库的 [README](https://github.com/4fuu/personal-bot) 里；
上下文与记忆的机制细节在 [docs/how-it-works.md](https://github.com/4fuu/personal-bot/blob/main/docs/how-it-works.md)。

<!--
  站点头图是 frontmatter 里注释掉的 hero.image（文件来自仓库的 assets/）；
  控制台截图只允许用 apps/console 的 mock 模式（合成数据）拍摄，放在 public/ 下。
-->
