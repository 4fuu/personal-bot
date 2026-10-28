# How the assistant works: turns, context, and memory

`personal-bot` runs one long-lived assistant session per account. It processes
one turn at a time, and everything that persists from one turn to the next
lives in three places: a rotating context window, notes written by the
assistant itself, and an append-only log of its turns and tool calls. This
document explains what starts a turn, how messages are batched and scheduled,
how context windows rotate without breaking prompt caching, how notes work, and
how this design compares with other projects.

## What starts a turn

Every turn has an explicit trigger reason recorded in the console log:

- **Incoming messages:** A private message, or a group message that @mentions
  the assistant, replies to one of its messages, or uses its nickname, alias,
  or keyword, starts a turn when allowed by that conversation's policy.
  Unaddressed group messages can also start a turn when the assistant decides
  to join the conversation (see below).
- **Wake words:** When the assistant finishes a turn without speaking (or while
  waiting), it can leave a few wake words armed in that conversation. For the
  next six hours, any message containing one of those words starts a new turn
  even without a direct mention. The next turn in that conversation clears the
  armed words.
- **Timed waits:** The assistant can pause and check back on the current
  conversation after anywhere from one minute to 24 hours. When the timer
  expires, a turn opens with the conversation's latest messages. At most ten
  consecutive waits are allowed; if another turn starts in that conversation
  first, the pending wait is canceled.
- **Scheduled tasks:** One-off or recurring tasks that open a turn in a target
  conversation at a specified local time, passing the task's note as input.
  Tasks can only be created, updated, or canceled from a system admin's private
  chat while citing a message from that admin. If the bot was offline or paused
  when a run was due, it fires once if at most an hour late, and is skipped and
  logged if older.
- **Free turns:** When a configured number of minutes passes with no turn of
  any kind, the assistant opens a conversation-free turn of its own to spend on
  whatever it finds interesting—searching the web, reading, using MCP tools,
  updating notes—or nothing at all. Free turns are off by default (`0` minutes)
  and can be enabled on the console's **高级** page.

Starting any turn resets the free-turn timer. Pending waits, wake words, and
scheduled tasks are stored in SQLite, survive restarts, and never pile up
into duplicate runs after downtime.

## Batching, joining in, and queueing

- **Per-conversation batching:** Rapid-fire messages in a conversation are
  collected into a single batch before a turn decision is made. The debounce
  waits 2 seconds in a quiet chat, 5 seconds while a turn is running, 2 seconds
  while the same sender keeps typing, 0.5 seconds when another sender chimes in,
  at most 1 second when the assistant is @mentioned, and at most 8 seconds in
  total (all measured from message arrival time so stream lag never splits a
  batch).
- **Joining group conversations:** In groups where proactive speaking is
  enabled, batches that @mention only other people are ignored immediately. For
  everything else, [Jev](https://typesafe.ai/) estimates the probability that
  joining the conversation right now is natural. The host then subtracts a
  bounded penalty (up to `0.3` by default) based on how recently the assistant
  spoke in that group, its recent share of messages, how low the group's
  talkativeness slider is set, and time-of-day quiet rules. If a message in the
  batch @mentions the assistant, that penalty is reduced slightly (`0.1`).
- **Idle backoff:** After two consecutive group batches end without a reply
  (either declined by the join-in gate or ended silently by the model), the
  next join-in evaluation in that group is delayed by 15 seconds, doubling on
  each further silent batch up to 5 minutes. Messages continue accumulating in
  the batch rather than being dropped, and a direct @mention, nickname/alias,
  wake word, or a burst of six or more messages ends the delay immediately.
- **Reply timing:** After a batch passes the trigger gate,
  [Jev](https://typesafe.ai/) can score whether the assistant should answer
  immediately, pause briefly, or wait a little longer for follow-up messages
  (capped at 30 seconds for mentions and admins, or at the conversation's
  private/group cap, with ±20 % jitter). New messages that arrive during that
  pause join the same batch.
- **Turn queue:** Only one turn runs at a time across the account. Mentions and
  private chats take priority over group join-ins and timer wakes, and any
  conversation that has waited longer than the starvation limit (120 seconds by
  default) moves to the front. Within the same priority class,
  [Jev](https://typesafe.ai/) can score waiting conversations by urgency to
  reorder them.

## Inside a turn

- **Mid-turn messages:** If new messages arrive in the active conversation
  while a turn is running, they are injected into the running turn between tool
  calls so the assistant can see the conversation evolve before replying. While
  a free turn is running, any conversation batch that passes debounce and
  trigger checks is handed over the same way. Messages that arrive just as a
  turn finishes are returned to the inbox for the next turn.
- **Optional replies and outbound review:** Only text sent through the send tool
  reaches the chat; ending a turn silently is normal. Every send must cite the
  messages, notes, or history records it draws on. Before any bubble is sent,
  the host blocks cross-chat private or secret citations (unless authorized by
  an admin), scrubs any stored secret values, and runs per-bubble
  [Jev](https://typesafe.ai/) checks.
- **Autonomous exploration:** The assistant records topics and details it finds
  interesting into notes, allowing later turns, timed waits, or free turns to
  pick them up naturally.

## One session, rotating context windows

An account has a single continuous identity and history, but its working memory
is not a single transcript that grows forever or gets repeatedly re-summarized
in place. Instead, context is managed as a sequence of windows, each bounded by
a token budget:

- **Frozen prefix for prompt caching:** While a window is open, its system
  prompt and window bootstrap never change. Notes in the bootstrap are sorted
  deterministically, and no timestamps or counters are placed in the prefix, so
  the model provider's prompt cache stays valid across every turn in the window.
- **Staged tail reminders:** As token usage climbs, the host appends reminders
  to the end of the newest turn (never modifying the cached prefix):
  - at **15 %, 30 %, and 50 %** of the window limit: create or update notes;
  - at **60 %, 70 %, and 80 %**: update notes, write a handoff, and roll over
    to a new window when the current topic reaches a natural pause;
  - shortly before the **hard limit** (`window - min(16k, window / 4)`): a
    final warning that the next turn will force an automatic rollover without a
    handoff.
  Each reminder includes the window's actual token numbers and clearly marks
  itself as a host notice rather than a user message. If token usage jumps past
  multiple thresholds at once, only the highest crossed reminder is sent.

## Notes: long-term memory

Notes are written and maintained by the assistant itself and serve as its
long-term memory across windows.

- **One-line summaries:** Every note has a required summary of at most 200
  characters. Search results and the window bootstrap include only these
  summaries—never the full note bodies—so keeping up to 20 active notes in
  context is inexpensive, and full note bodies are read on demand. Updating a
  note's body requires updating its summary as well.
- **Quotas and token budget:** A window can create at most 10 new notes by
  default (editing existing notes does not count toward that limit). Active
  notes also share the window's token budget: writes begin warning at 15 % of
  the window and refuse further growth past 20 %, while edits that shorten a
  note or delete an obsolete one are always permitted.
- **Automatic active set at rollover:** The assistant never manually pins or
  unpins notes. When a window rolls over, the host selects the next window's
  active set (up to 20 notes and 15 % of the window by default) in a fixed
  order:
  1. notes marked **常驻** (pinned) by an admin in the console;
  2. notes created or edited during the closing window;
  3. remaining notes ranked by decayed usage score (direct citations weigh
     most, 1-hop linked citations through a note's evidence or message range
     weigh next, and reads/searches weigh least), with
     [Jev](https://typesafe.ai/) contributing up to a 15 % adjustment on the
     top candidates.
- **Append-only revisions and anchors:** Notes are never overwritten in place.
  Every create, edit, or delete appends a new revision carrying a host-recorded
  anchor (window ID, event record, conversation, message cursor, cited
  evidence, and optional message range), so every revision remains traceable to
  the exact conversation context that produced it.

## Rolling over to a new window

A window can roll over in three ways:

- **By the assistant:** Once the window is at least 60 % full, the assistant can
  roll over by writing a brief four-part handoff (current topics, progress,
  open to-dos, and agreements, capped at roughly 4,000 tokens). Calls below
  60 % usage are refused so context is not discarded prematurely.
- **At the hard token limit:** If usage reaches the hard limit, the host opens
  a new window automatically with no handoff.
- **By an admin in the console:** Clicking **立即轮换** on the **概览** or
  **人设** page schedules a rollover at the next turn boundary regardless of
  current token usage. It requires a short reason, which is placed at the very
  top of the new window's bootstrap.

Every window after the first opens with a fixed host orientation note (plus the
admin's reason on a manual rollover), followed by the handoff (when present),
the active notes' summaries, the titles of any notes archived at this rollover,
and the current chat's recent messages. When a window opens without a handoff,
the opening note instructs the assistant to recover context in order—active
notes first, then messages around the latest note anchor, then its own history
records, and finally full-text search—so users are never asked to repeat
themselves.

## Jev: structured decisions and safety checks

[Jev](https://typesafe.ai/) is TypeSafe AI's decision model. It never writes
chat replies or executes tools; instead, the host asks it structured yes/no
probability questions (0–1) and multi-level scoring questions (0–2) and applies
the result within hard code bounds:

- **Group join-in (0–1 probability):** Whether joining a group chat right now
  is natural, before subtracting the host's activity penalty. Active by
  default when a group's speech mode allows proactive replies.
- **Reply timing (0–2 score):** Whether to answer immediately, pause briefly,
  or wait longer for follow-up messages. Ships in **只记录不生效** (shadow) mode
  by default.
- **Turn order (0–2 score per waiting chat):** How urgently each queued
  conversation needs a reply, subject to priority classes and the starvation
  guard. Ships in **只记录不生效** (shadow) mode by default.
- **Quoting (0–1 probability):** Whether the first bubble of a reply should
  quote the message it answers (targets older than 30 messages or 10 minutes
  are always quoted). Ships in **只记录不生效** (shadow) mode by default.
- **Outbound review (0–1 probability per bubble):** Checked on every send:
  - **泄露密钥** (secret leak): whether a bubble exposes a complete API key,
    token, password, database key, or verification code. Always active; if Jev
    is unreachable, outbound review fails closed and sends nothing.
  - **没标引用** (uncited claim): whether a bubble states a specific fact about
    a person or event not covered by its citations or recent chat context. Off
    by default.
  - **自我重复** (self-repetition): whether a bubble repeats what the assistant
    already said recently in the same chat. Ships in **只记录不生效** (shadow)
    mode by default.
- **Sandbox network gate (0–1 probability):** When a command in the sandbox
  requests a domain that is on neither the allowlist nor the denylist, Jev
  judges whether the command reasonably needs that domain and is not using a
  paste or exfiltration service. Passing domains are saved to the allowlist,
  failing ones to the denylist, and unreachable Jev defaults to deny.
- **Active-note scoring at rollover (0–2 score per candidate):** Scores up to
  eight candidate notes by how likely they are to be needed in the next window,
  adjusting their usage score by up to 15 %.

For the configurable conversation, queue, and review checks, the console lets
you set the threshold, add a custom criterion in plain language, and switch
modes between **关闭** (off), **只记录不生效** (shadow: Jev is queried and
logged, while the default rule acts), and **启用** (active).

Whenever a question judges a conversation, the host builds a bounded context
slice of up to roughly 6,000 tokens from Jev's 32,000-token window—dropping the
oldest complete messages first, never splitting a message in half, and
recording how many older messages were omitted. Stored secrets are scrubbed
from every request before it leaves the host, and checks that evaluate only
nearby facts (quoting, self-repetition, outbound review, and active-note
scoring) do not receive the assistant's persona.

## Comparison with other projects

The table below summarizes how `personal-bot` and four related projects manage
context windows and long-term memory, based on each project's public
documentation as of 2026-10-26.

| Project | Scope | Context window management | Long-term memory |
| --- | --- | --- | --- |
| **personal-bot** | Self-hosted personal assistant for a single chat account | Rotating windows with a frozen prefix, staged token reminders, and a four-part handoff at rollover; past windows stay searchable as raw logs | Assistant-written notes with one-line summaries, a token budget, append-only revisions with message anchors, and a host-selected active set per window |
| [AstrBot](https://github.com/AstrBotDevs/AstrBot) | Multi-platform chatbot framework | Per-conversation context compressed automatically at 82 % of the model window by dropping older rounds (default) or summarizing while keeping the newest 15 % | No built-in conversational memory; provides a document knowledge base for retrieval and optional group history injection |
| [MaiBot](https://github.com/Mai-with-u/MaiBot) | Group-focused chatbot framework | Sliding recent-message window whose trimmed history is summarized by a dedicated model | A-Memorix: vector, graph, and BM25 retrieval over extracted memories, isolated per chat stream by default |
| [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) | Open-source agent harness by DeepSeek | Context derived from an append-only session log; compacts automatically at 80 % of the routed model's window, keeping the newest 16 % verbatim after trimming large tool outputs | No built-in memory store; reference setups connect external memory servers over MCP |
| [pi](https://github.com/earendil-works/pi) | TypeScript agent framework that `personal-bot` builds on | Append-only session tree; automatic compaction near the window limit summarizes older turns while keeping roughly the newest 20,000 tokens (plus manual `/compact`) | Project instruction files and skills in context; no built-in chat memory |

Both `pi` and DeepSeek Harness keep a single running session and replace older
spans with an in-place summary when the context fills up. `personal-bot`
instead closes the window, opens a fresh one with a handoff and active note
summaries, and leaves the old window untouched and searchable: rollover incurs
one prompt-cache miss, but past turns are never lossily re-summarized. AstrBot
and MaiBot compress per-chat history and pair it with an external retrieval
store (AstrBot's knowledge base or MaiBot's A-Memorix), whereas `personal-bot`
keeps memory as explicit, source-anchored notes that the assistant writes,
edits, and cites across all conversations.

### Sources

- AstrBot: [context compression](https://docs.astrbot.app/en/use/context-compress.html),
  [knowledge base](https://docs.astrbot.app/en/use/knowledge-base.html),
  [configuration reference](https://docs.astrbot.app/en/dev/astrbot-config.html)
- MaiBot: [memory configuration](https://docs.mai-mai.org/en/manual/configuration/amemorix-config),
  [memory management](https://docs.mai-mai.org/en/manual/webui/memory-management),
  [model roles](https://docs.mai-mai.org/en/develop/llm-providers)
  (the repository moved from `MaiM-with-u` to `Mai-with-u`; old URLs redirect)
- DeepSeek Harness: [compaction](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/compaction),
  [connecting a memory server](https://deepseek-harness.github.io/deepseek-harness/en/guide/mcp-memory),
  [product page](https://www.deepseek.com/en/harness/)
- pi: [sessions](https://pi.dev/docs/latest/sessions),
  [compaction](https://pi.dev/docs/latest/compaction)
