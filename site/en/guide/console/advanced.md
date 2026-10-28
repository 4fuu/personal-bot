# Advanced settings

The advanced page holds the rarely changed numbers and switches, in six cards.

## 读取范围: the scope

Which conversations the driver reads - the outer boundary of the bot's allow list,
enforced by the driver. Two modes: **全部会话** (all) or **仅选中的会话** (only the
selected ones, chosen in the 状态 column on [Conversations](./conversations)).
Switching from 全部会话 seeds the selection with what the driver reads today, so
the switch never drops the whole mirror out of the scope in one step.

## 发送节奏: the pacing

Every send goes through the driver's queue, which the client cannot bypass. A
conversation that exceeds its character budget waits for the window to free room.

| Item | Default | What it is |
| --- | --- | --- |
| 最小间隔 | — | the minimum interval between two actions (seconds) |
| 中文速度 | — | Chinese characters typed per minute |
| 其他字符速度 | — | other characters per minute (English, digits, faces) |
| 图片和贴纸 | — | what one image or sticker costs in Chinese characters |
| 小黄脸 | — | what one QQ face costs in Chinese characters |
| 统计窗口 | — | how long a stretch counts as one conversation's typing; 0 means interval only |
| 最长等待 | — | the most one send may wait before it errors |

**Keep the defaults**: with an automated chat client, behaviour matters as much as
the method.

## 合并消息: batching

How long messages arriving back to back in one conversation are collected before
a turn starts (seconds):

| Item | Default | What it is |
| --- | --- | --- |
| 静默等待 | 2 | after the last message, how long to wait |
| 轮次进行中 | 5 | while the previous turn is still running |
| 同一人连续发 | 2 | when the same person keeps typing |
| 换人发 | 0.5 | when someone else answers |
| 被叫到的上限 | 1 | the most a batch that @s the bot may wait |
| 一批的上限 | 8 | from this batch's first message, the most it may take |

## 排队: the queue

Which waiting conversation is answered first.

- **饿等上限** (the starvation guard, 120 s by default): a conversation that has
  waited this long goes first, whatever Jev says.
- **需要程度** (urgency): Jev may reorder by how urgently a conversation needs an
  answer, threshold 0-2, with the same three modes and an optional criterion.

## 空闲轮: the free turn

After this many minutes with no turn at all, the bot opens a turn of its own that
belongs to no conversation, to spend on whatever it finds interesting - searching,
reading, using its tools, writing notes - or on nothing. 0 is off, which is where
it ships. Any turn start resets the timer, and the free turn counts as one; it
does not open while the bot is paused, has no admin, or is running a turn. The
ceiling is one day.

## 工具: tools

`code_exec` moves the edge tools behind one coding tool: the model writes a script
that calls them. On by default; turning it off is the documented fallback for a
model that is bad at `code_exec`. The change takes effect at the next window.
