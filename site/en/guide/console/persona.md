# Persona

The **人设** page manages every identity field rendered into the assistant's
system prompt. It organizes the fields across four tabs above a shared save bar
that tracks unsaved changes:

| Tab | Fields |
| --- | --- |
| **基本** (Basic) | **昵称** (nickname used in chats) and **别名** (aliases, added with Enter; also used for mention and wake detection) |
| **风格** (Style) | **性格** (background and personality), **行为风格** (when to speak, initiative, conversational etiquette), and **回复风格** (phrasing, length, punctuation) |
| **示例** (Examples) | **示例对话** (example dialogs): paired user and assistant lines included as few-shot style examples |
| **禁忌** (Never mention) | **禁忌话题** (topics added with Enter and listed under the system prompt's `绝不提及` section so the assistant never brings them up) |

## When changes take effect

To keep the model provider's prompt cache valid, the system prompt is frozen for
the entire life of a context window. Saving edits on this page updates the
stored identity immediately, and the new system prompt takes effect **at the
next window rollover** (as noted in the banner above the tabs).

To apply your changes right away, save them and click **立即轮换** in the page
header. A modal will prompt you for a brief rollover reason (required, up to
500 characters); the bot will then open a fresh window with the updated persona
at the next turn boundary and record your reason in both the log and the new
window's opening note.

While the assistant's own rollover tool is only accepted once a window is at
least 60 % full (and requires a four-part handoff), an admin's manual
**立即轮换** from the console has no usage floor and can be triggered at any
time (see [How it works](../how-it-works)).
