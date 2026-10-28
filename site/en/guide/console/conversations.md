# Conversations and policies

The **会话** page controls which chats the assistant can see, where it is
allowed to speak, and how it participates in each one. The table lists every
private chat and group the account currently belongs to (groups the account has
left are omitted from the table while their past messages remain in the mirror),
showing five columns: **名称** (name), **类型** (type), **状态** (status),
**说话方式** (speech mode), and **覆盖** (how many fields that conversation
overrides from its template).

## 状态 (Status): one selector, two stores

Changing a row's **状态** selector saves immediately and updates both the
driver's read scope and the bot's allowlist in one step, preventing a mismatch
where the bot allows a conversation that the driver is not reading:

| Status | Meaning |
| --- | --- |
| **参与** (Participate) | Included in the driver's scope and on the bot's allowlist—the assistant reads messages here and may reply according to its speech mode |
| **只记录** (Record only) | Mirrored by the driver and browsable in the console, but invisible to the assistant |
| **不读取** (Do not read) | Ignored by the driver; only the conversation's name is shown in the list |

While **读取范围** on [Advanced settings](./advanced) is set to **全部会话**,
the driver mirrors every conversation, so the selector offers only **参与** and
**只记录**. Switching **读取范围** to **仅选中的会话** pre-populates the
selection with the conversations currently being read and unlocks **不读取**.
By default, the allowlist starts empty, meaning no conversation is set to
**参与** and the assistant sees nothing until you enable at least one.

## 说话方式 (Speech mode): five modes

| Mode | Private chat | Group chat | Behavior |
| --- | --- | --- | --- |
| **每条都回** (Reply to everything) | Yes | — | Every batch starts a turn (private-chat default) |
| **只在被叫到时回** (Only when addressed) | Yes | Yes | Starts a turn only when directly addressed |
| **被叫到必回，其他时候看情况接话** (Reply when addressed, otherwise join in naturally) | — | Yes | Always starts a turn when addressed; otherwise asks Jev whether to join in (group default) |
| **全部看情况接话** (Always decide by context) | — | Yes | Even direct mentions go through the Jev join-in check as a hint |
| **不说话** (Silent) | Yes | Yes | Never speaks in this conversation |

**被叫到** (addressed) means: @mentioning the assistant, replying to one of its
messages, mentioning its persona nickname, or mentioning one of the **别名**
(aliases) or **关键词** (keywords) configured below.

## Three access switches

- **接收新消息** (Receive new messages): when off, incoming messages here never
  start a turn (and any pending batch is dropped).
- **允许发送** (Allow sending): when off, the assistant cannot send messages or
  files to this conversation.
- **允许被查阅** (Allow retrieval): when off, the assistant cannot read or
  search this conversation's history from any turn or note lookup.

Turning off either **接收新消息** or **允许发送** automatically locks
**说话方式** to **不说话** and explains why.

## 看情况接话 (Joining in on group chats)

Selecting either of the two proactive group modes unlocks three controls:

- **话痨度** (Talkativeness): a `0`–`3` slider (`1.0` by default); higher values
  make the assistant more willing to join in.
- **按时段调整** (Time-of-day rules): scales talkativeness by a `0`–`2` factor
  during specific `HH:MM` time ranges; leave empty to keep it constant all day.
- **接话规矩** (Join-in criterion): plain-text guidance on when joining in is
  appropriate or unwelcome, passed directly to [Jev](https://typesafe.ai/).

When an unaddressed group batch arrives, [Jev](https://typesafe.ai/) scores
whether joining in is natural, and the host subtracts a bounded penalty based
on how recently the assistant spoke there, its share of recent messages, low
talkativeness, and quiet hours (reduced slightly if the batch @mentions the
assistant). Batches that @mention only other members are skipped outright.
After two or more consecutive batches where the assistant stays silent, the
next join-in check in that group backs off (holding messages in the batch
without dropping them) until an @mention, nickname/alias, wake word, or burst
of messages arrives.

## 算作叫到我的词 (Addressing words)

Add custom **别名** (aliases) and **关键词** (keywords) by typing a word and
pressing Enter.

## 高级 (Advanced): reply timing and quoting

Expanding **高级** at the bottom of the form reveals two [Jev](https://typesafe.ai/)
decisions:

| Decision | What it controls | Threshold range |
| --- | --- | --- |
| **回复时机** (Reply timing) | How long to wait for follow-up messages before starting the turn | `0`–`2` (score required before waiting) |
| **引用** (Quote) | Whether the first bubble of a reply quotes the message it answers (messages older than 30 rows or 10 minutes are always quoted) | `0`–`1` |

Each decision can be set to **关闭** (off), **只记录不生效** (shadow: Jev is
asked and logged while the default rule acts), or **启用** (active within rule
bounds), plus an optional **额外判断** (custom criterion). **回复时机** also
lets you set **私聊上限（秒）** (default `30` s) and **群上限（秒）** (default
`60` s); direct mentions and admin messages wait at most `30` s.

## 默认规则 (Default templates) and per-conversation drawers

Clicking **默认规则** in the page header opens a drawer with **私聊** and **群**
template tabs, plus the global **插话** settings at the bottom of the **群** tab
(threshold `0`–`1`, maximum penalty `0`–`1` where `0` lets Jev decide alone,
and an optional criterion).

Clicking any conversation row opens its drawer with four tabs:

- **规则** (Rules): available for conversations set to **参与**. Each field is
  badged **默认** or **覆盖**, with a **恢复默认** button on overridden rows.
- **消息** (Messages): shows the 20 most recent messages, with **打开全部**
  linking to the full conversation message view.
- **记录** (Records): shows recent trigger, join-in, and review decisions for
  this conversation.
- **唤醒词** (Wake words): read-only list of wake words the assistant left armed
  at the end of a quiet turn, along with their remaining lifetime (up to six
  hours; cleared when the next turn starts in this chat).
