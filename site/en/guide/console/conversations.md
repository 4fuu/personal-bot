# Conversations

The conversations page answers one question: who does the assistant talk to. Its
table lists the mirror's conversations, five columns each: name, type, **状态**
(status), **说话方式** (how it speaks), and how many rules that row overrides. A
change acts at once and the page keeps no save bar.

## 状态: three values, two stores

| 状态 | Meaning |
| --- | --- |
| 参与 | the driver reads it and the bot is allowed to see it - it is read, and may be answered |
| 只记录 | the driver reads it and the panel shows it, but the bot does not see it - kept, silent |
| 不读取 | the driver drops it; the panel shows its name only |

One select writes both stores at the same time: the driver's scope and the bot's
allow list, which is why "allowed by the bot but outside the scope" cannot be
chosen. The scope mode is the 读取范围 card on [Advanced](./advanced);
不读取 is not offered while it reads 全部会话, and switching to 仅选中的会话 seeds
the selection with what the driver reads today. Nothing is allowed by default:
an empty allow list means the bot sees no conversation at all.

## 说话方式: five modes

| Mode | Private | Group |
| --- | --- | --- |
| 每条都回 (answer everything) | yes | |
| 只在被叫到时回 (only when addressed) | yes | yes |
| 被叫到必回，其他时候看情况接话 (answer when addressed, otherwise maybe) | | yes |
| 全部看情况接话 (always a maybe) | | yes |
| 不说话 (silent) | yes | yes |

Addressed means: @ it, reply to its message, mention its nickname, or one of the
aliases / keywords set below.

## The three switches

- **接收新消息** (receive): off means new messages here no longer start a turn.
- **允许发送** (send): off means the bot cannot send into this conversation.
- **允许被查阅** (retrieve): off means the bot cannot see this history when it
  searches or writes notes in any conversation.

With 接收 or 允许发送 off, 说话方式 is locked at 不说话 with the reason shown -
a save never has to fail on the policy's dependency rule.

## 看情况接话: joining in (groups)

The block the two group modes unlock:

- **话痨度** (talkativeness): a 0-3 slider; higher means it joins in more, and
  the time rules and the criterion below still govern it.
- **按时段调整** (time rules): scale talkativeness per `HH:MM` band with a 0-2
  factor each; empty means no change all day.
- **接话规矩** (criterion): free text on when joining in fits and when it does
  not, which the judging model reads.

Whether it joins is scored by [Jev](https://typesafe.ai/); the stack subtracts a small
penalty when the assistant has just been talking there, a little less when the
batch @s it, and a batch aimed only at other people is left alone. After a few
batches in a row where it stayed out, the next check waits longer - messages are
held, not dropped - and an @, its name, a wake word or a burst of messages ends
the delay at once.

## 算作叫到我的词: words that count as addressing it

**别名** (aliases) and **关键词** (keywords), added with Enter, as many as you
like.

## 高级: two Jev decisions

| Decision | What it decides | Threshold |
| --- | --- | --- |
| 回复时机 (reply timing) | how long to wait for more messages before answering | 0-2: the score at which waiting is worth it |
| 引用 (quote) | whether a reply quotes the message it answers | 0-1 |

Each has three modes: **关闭** (never asked), **只记录不生效** (asked and logged,
the rule default still acts - where every new decision ships), and **启用** (acts
on the answer inside the rule's bounds). Besides the threshold each takes an
optional 额外判断, your own extra criterion for that decision. 回复时机 also
carries two caps, the most a private chat and a group may wait (30 s / 60 s by
default); an @ or an admin waits at most 30 s.

## 默认规则 and one conversation

The 默认规则 drawer holds the private and group templates plus the join-in
question (threshold 0-1, the penalty ceiling 0-1, an optional criterion):
a ceiling of 0 lets Jev alone decide. Clicking a conversation opens its drawer
with four tabs:

- **规则** (rules): every field above, marked 默认 or 覆盖 per row, with
  恢复默认; an override stores only the fields it changes.
- **消息** (messages): the recent traffic, 打开全部 into the conversation's
  message sub-page.
- **记录** (records): this conversation's recent decisions and sends.
- **唤醒词** (wake words): read-only. The words a quiet end of turn left armed -
  any of them starts a new turn for six hours, and the next turn clears them.
