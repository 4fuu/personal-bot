---
layout: home

hero:
  name: personal-bot
  text: 自托管的个人助理
  tagline: 部署在自有设备上，记忆保存在本地文件，直接在日常使用的聊天软件中回复消息。
  # 头图：仓库里的 release/personal-bot/assets/mascot-hero.png（吉祥物的网页尺寸
  # 副本，透明背景 PNG）。VitePress 会给它加上 base（/personal-bot/），所以这里写
  # 站点根目录相对的路径；发布 workflow 把仓库的 assets/ 复制到站点根目录。
  image: /assets/mascot-hero.png
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/quick-start
    - theme: alt
      text: 工作原理
      link: /guide/how-it-works

features:
  - title: 读取消息
    details: 从客户端本地数据库的私有解密副本中读取真实的消息 ID、发送者、@提及、引用关系及缓存路径，不监听客户端内部消息流。
  - title: 发送与媒体下载
    details: 文字、小黄脸、图片、表情包、文件、@提及和引用回复均调用客户端自身接口发送，由单一队列按接近真人的随机间隔控制节奏，并按需下载指定消息的图片与文件。
  - title: 长期记忆
    details: 模型自己撰写与维护笔记，每条修订均锚定原始消息与历史事件；全部轮次与工具调用均记入可检索的事件日志。
  - title: 延后跟进
    details: 支持延时等待、唤醒词、管理员在私聊中设定的定时任务，以及在长时间无对话时自由活动的空闲轮。
  - title: 工具与扩展
    details: 支持网页搜索与网页阅读、隔离沙箱中的命令行与文件操作、脚本串联调用、Skills 技能以及 MCP 服务器（可按函数单独启停）。
  - title: Web 管理面板
    details: 涵盖实时画面与登录、会话策略、人设、记忆、表情包、定时任务、模型与服务商、安全与网络、工作区、高级设置及实时日志。
---


::: warning 运行前必读
本项目通过驱动第三方桌面客户端运行，不属于该客户端服务条款允许的范围，可能导致账号受限或封禁。请使用已有正常使用记录的小号，在家庭宽带环境下运行，并保持默认的发送节奏。本项目为个人研究项目，按“现状”提供，一切风险由使用者自行承担。运行前请先阅读[免责声明](./guide/disclaimer)。
:::

## 项目架构

整套服务由四个容器组成，一套实例对应一个账号：`qq` 容器在虚拟屏幕中运行官方桌面客户端，`bot` 容器运行模型，`console` 容器提供 Web 管理面板，模型的命令行操作则在隔离的 `sandbox` 容器中执行。

<p align="center">
  <img src="../assets/architecture.zh-CN.svg" alt="一套实例的架构：官方桌面客户端无头运行并写入本地数据库；该数据库的私有解密副本交给驱动服务，驱动服务通过 HTTP 与 WebSocket 向 console :8080 与 bot :8766 提供服务，经客户端自身发送消息、按需下载媒体并自动点击“登录”；模型的命令在 sandbox :8791 中以非特权用户执行" />
</p>

## 从这里开始

- [快速开始](./guide/quick-start)：环境要求、克隆仓库、配置 `.env`、启动容器。
- [首次启动与扫码登录](./guide/first-start)：QQ 安装包来源、数据库密钥提取与手机扫码登录。
- [环境变量（.env）](./guide/env)：`.env` 中各项变量的完整说明。
- [控制台指南](./guide/console/)：管理面板各个页面的功能与设置项说明。
- [MCP 客户端（OAuth）](./guide/mcp)：通过 OAuth 2.1 将模型注册到外部 MCP 服务器。

## 支持 [pi](https://pi.dev) 生态内的全部模型

模型运行在 [pi](https://pi.dev) 框架之上，支持 pi 集成的所有模型服务商与视觉模型。在控制台的[模型与 Jev](./guide/console/models)页面即可登录服务商或配置 API key。模型目录在服务启动时自动拉取，此后每天自动刷新一次（设置 `PI_OFFLINE=1` 时关闭联网拉取），也可随时在页面顶部手动刷新，新发布的模型无需重启容器即可选用。

完整项目说明见仓库 [README](https://github.com/4fuu/personal-bot)；轮次、上下文与记忆机制的详细对比见 [docs/how-it-works.zh-CN.md](https://github.com/4fuu/personal-bot/blob/main/docs/how-it-works.zh-CN.md)。

<!--
  控制台截图只允许用 apps/console 的 mock 模式（合成数据）拍摄，放在 public/ 下。
-->
