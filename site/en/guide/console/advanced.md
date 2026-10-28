# Advanced settings

The **高级** page groups six cards of low-frequency timing parameters and
system-level switches.

## 读取范围 (Driver read scope)

Controls which conversations the driver syncs from the client database into its
mirror—forming the outer boundary enforced before the bot's allowlist:

- **全部会话** (All conversations, default): the driver mirrors every
  conversation, and you choose which ones the bot participates in via **参与** /
  **只记录** on [Conversations and policies](./conversations).
- **仅选中的会话** (Selected conversations only): the driver mirrors only the
  selected conversations. Switching from **全部会话** to **仅选中的会话**
  automatically seeds the selection with the conversations currently in scope so
  existing mirrored history is not dropped; individual conversations are toggled
  in the **状态** column on [Conversations and policies](./conversations).

## 发送节奏 (Send pacing)

Every outbound message goes through the driver's single serialized action
queue. The minimum interval spaces consecutive actions apart, while the
per-conversation character budget charges each send at the configured typing
rates (Chinese and other characters share one sliding window budget per
conversation, with ±15 % random jitter), holding back bursts until room frees
up in the window:

| Setting | Default | Meaning |
| --- | --- | --- |
| **最小间隔** (Min interval) | `3` s | Minimum delay between any two actions |
| **中文速度** (Chinese rate) | `240` chars/min | Typing rate charged for CJK characters and fullwidth punctuation |
| **其他字符速度** (Other rate) | `960` chars/min | Typing rate charged for Latin letters, digits, emoji, and whitespace |
| **图片和贴纸** (Image / sticker cost) | `10` chars | Chinese-character equivalent charged for one image, sticker, or file |
| **小黄脸** (Built-in face cost) | `2` chars | Chinese-character equivalent charged for one built-in QQ face |
| **统计窗口** (Budget window) | `60` s | Sliding time window over which a conversation's character budget is measured (`0` disables the character budget and keeps only the minimum interval) |
| **最长等待** (Max rate wait) | `900` s | Maximum time a single send may wait for budget room before failing with an error |

**Keep the default pacing:** when automating a desktop client, natural send
rates matter as much as the integration method.

## 合并消息 (Message batching)

Controls how long consecutive messages arriving in one conversation are
collected into a batch before a turn starts:

| Setting | Default | Meaning |
| --- | --- | --- |
| **静默等待** (Quiet wait) | `2` s | Wait after the last message in an idle conversation |
| **轮次进行中** (Turn running) | `5` s | Wait while a turn is already running |
| **同一人连续发** (Same sender) | `2` s | Wait while the same sender keeps sending messages |
| **换人发** (Sender change) | `0.5` s | Wait when a different sender replies |
| **被叫到的上限** (Mention cap) | `1` s | Maximum wait once a message in the batch addresses the assistant |
| **一批的上限** (Batch cap) | `8` s | Maximum total wait measured from the first message in the batch |

## 排队 (Turn queue)

Controls which waiting conversation runs next when several are queued (mentions
and private chats always run ahead of group join-ins and timer wakes):

- **饿等上限** (Starvation guard, default `120` s): any conversation that has
  waited longer than this limit moves to the front regardless of Jev's scores.
- **需要程度** (Urgency via [Jev](https://typesafe.ai/)): scores waiting
  conversations (`0`–`2` threshold) by how urgently they need a reply now.
  Supports **关闭** (off), **只记录不生效** (shadow, the default), and **启用**
  (active), plus an optional **额外判断** (custom criterion).

## 空闲轮 (Free turns)

Sets **空闲轮间隔（分钟）** (default `0`, which disables free turns; maximum
`1440` minutes / 24 hours). When this many minutes pass since the last turn of
any kind started, the assistant opens a conversation-free turn of its own to
browse, search, run tools, update notes, or stay silent. Starting any turn
(including a free turn) resets the timer, and no free turn opens while the bot
is paused, has no admin configured, or is running or queueing another turn.

## 工具 (Tool exposure)

Toggles `code_exec` (enabled by default). When enabled, secondary and edge
tools are placed behind the `code_exec` JavaScript runner so the assistant can
chain lookups and filtering in a single script call; turning it off exposes all
edge tools directly as a fallback for models that struggle with `code_exec`.
Changes take effect at the next window rollover.
