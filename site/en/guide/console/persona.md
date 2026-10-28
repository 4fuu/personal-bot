# Persona

The persona page is the long one: four tabs over one save bar, holding every
identity field the system prompt carries.

| Tab | Fields |
| --- | --- |
| 基本 (basic) | 昵称 (nickname, how groups call it), 别名 (aliases, added with Enter - they take part in @ matching and wake-word judgement) |
| 风格 (style) | 性格 (who it is: background, character), 行为风格 (when to speak, initiative, not talking over people), 回复风格 (wording, length, punctuation) |
| 示例 (examples) | example dialogs: one user line, one assistant line, added in pairs |
| 禁忌 (never) | 禁忌话题 (never-mention topics - these are also handed to the outbound review) |

## When a change takes effect

The system prompt is frozen for the whole context window, so identity changes
take effect **at the next rollover** - the banner above the tabs says so. To make
one act now, use 立即轮换 in the page header: it asks for a reason (required,
saying why the window is being rolled over by hand), and that reason opens the
next window's bootstrap and rides in the log record.

A rollover throws the window's context away, so the assistant's own tool refuses
one while the window is less than 60 % full - that is what the handoff it writes
is for; see [How it works](../how-it-works).
