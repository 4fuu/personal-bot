# How the assistant works: turns, context and memory

personal-bot runs one assistant per account. It works one turn at a time, and
everything it carries from one turn to the next lives in three places: a
rotating context window, notes it writes itself, and an append-only log of its
own turns and tool calls. This page lists what starts a turn, what happens
during one, and how context and memory are kept, each in a few sentences. The
rest of the stack (the containers, the panel, the sandbox) is described in the
README.

## What starts a turn

A turn always has a reason, and the panel's log shows it:

- **Messages.** A private message, or a group message that @s the assistant,
  replies to it or names it, starts a turn according to that conversation's
  policy. Other group messages may start one when the assistant decides to join
  in (below).
- **Wake words.** When the assistant ends a turn quietly, it can arm a few words;
  for six hours, any of them in that conversation starts a new turn without the
  assistant being named.
- **`wait`.** The assistant can say "look again in a while", from one minute to
  one day. When the time comes the conversation reopens with its newest
  messages. Up to ten waits in a row; a turn that starts there first cancels the
  pending one.
- **Scheduled tasks.** One-off or repeating tasks, each opening a turn in a
  chosen conversation with the task's note as its input. They are created and
  changed only in an admin's private chat.
- **Free turns.** When a set number of minutes passes with no turn at all, the
  assistant gets a turn of its own that belongs to no conversation, to spend on
  whatever it finds interesting - searching, reading, using its tools, writing
  notes - or on nothing. Off by default; the interval is a panel setting.

Every turn start resets the free-turn timer, waits and schedules survive a
restart, and none of them piles up during downtime.

## Batches and joining in

- **One decision per batch.** Messages are collected briefly before anything is
  decided: longer while the same person keeps typing, shorter when someone else
  answers, at most a second when the assistant is @'d, and never more than about
  eight seconds for a whole batch.
- **Joining in.** In a group where it may speak on its own, Jev (a smaller model,
  below) scores whether joining the conversation is natural; the
  stack subtracts a small penalty when the assistant has just been talking, and
  a little less when the batch @s it. A batch aimed only at other people is left
  alone.
- **Idle backoff.** After a few batches in a row where it stayed out, the next
  check in that group waits longer, doubling up to a few minutes. Messages are
  held, not dropped, and an @, its name, a wake word or a burst of messages ends
  the delay at once.
- **Queueing.** When several conversations are waiting, the one that has waited
  too long goes first; Jev can also reorder them by urgency, a panel
  setting that only logs its answers by default.

## During a turn

- **New messages arrive mid-turn.** A message from the conversation the turn is
  in is handed to the running turn between tool calls, so the assistant sees the
  conversation move. During a free turn, a batch from any conversation that
  passed the checks above is handed in the same way. A message that arrives just
  as a turn ends goes back to be judged as a batch of its own.
- **Speaking is optional.** Only what the assistant sends reaches the chat; it
  may end a turn without a word. Every send is checked before it leaves:
  citations for anything specific it says, and what may be said where.
- **Interests.** The assistant notes content it finds interesting, so later
  turns - a wait, a free turn, a conversation that touches the topic - can pick
  it up again.

## One session, rotating windows

The assistant keeps a single session for the whole life of the account, but its
working memory is not one transcript that grows forever. It is a sequence of
context windows, each with a token budget, and a window is replaced when tokens
- never a turn count - say so. While a window is open, its beginning never
changes, which keeps the model provider's prompt cache valid.

## Staged reminders

As a window fills, the stack appends reminders to its newest part, never to the
cached beginning:

- at 15 %, 30 % and 50 % of the budget: update the notes;
- at 60 %, 70 % and 80 %: additionally write a handoff and roll over;
- one final reminder shortly before the hard limit.

Each reminder carries the window's real numbers (used, limit, roughly what is
left), its place in the series, and what ignoring it costs. Every one is marked
as a stack reminder rather than a request from a person, and only the highest
tier crossed is sent.

## Notes: the long-term memory

Notes are written by the assistant itself and are its only long-term memory.

- Every note carries a summary of at most 200 characters, and every list shows
  the summary, never the body - so scanning many notes is cheap, and a body is
  read only when it is needed.
- Notes share the window's token budget: a write warns at 15 % of the window
  and is refused past 20 %; shrinking a note or deleting one is always allowed,
  because the budget refuses growth and never tidying.
- Each new window keeps an active set - at most 20 notes and 15 % of the
  window - which the stack picks at rollover: the admin's standing notes first,
  then the notes written or edited in the closing window, then the rest by
  measured usage, with Jev allowed to weigh in.
- Everything else stays archived and searchable. Notes are append-only and
  anchored to the messages and actions they came from, so a note keeps pointing
  at its sources after it is edited.

## Rollover

- The assistant can roll over on its own by writing a handoff in four short
  parts: the current topics, progress, open to-dos and agreements. The tool
  refuses the call while the window is less than 60 % full, because a rollover
  throws the window's context away. The handoff is capped at about 4 000
  tokens, because it opens - and then sits in the cached prefix of - the next
  window.
- At the hard limit the stack rolls over by itself with no handoff at all. That
  window's context is not replayed.
- An admin can roll over from the panel at any time, with a reason that
  opens the next window.

## What a new window opens with

Every window after the first begins with a fixed opening note, followed by the
active notes, the handoff (when there is one) and the chat's recent messages.
The previous window's transcript is not replayed, but it stays reachable:

- notes, by search and by reading bodies;
- the assistant's own history - which windows exist, what happened in one, what
  surrounds a given record;
- the chat log itself.

The opening note gives that recovery order: notes first, then the messages
around the last anchor, then the history by anchor, then search.

## Jev: the small judging model

Jev is a second, smaller and faster model. It never writes replies or does
anything itself; it answers short yes/no questions with a probability, and the
stack compares that against a threshold. It is used in these places:

- **Joining in.** Whether joining a group conversation is natural right now
  (the stack then subtracts its own penalty, see above). Acts by default.
- **Reply timing.** How long to wait for more messages before answering.
- **Quoting.** Whether a reply should quote the message it answers.
- **Queue order.** Which waiting conversation needs an answer most urgently.
- **Outbound review.** Every bubble, before it leaves: does it carry a
  credential (always checked), does it repeat what the assistant already said
  there, does it pass on a specific private fact it cannot cite (off by
  default).
- **Network gate.** A domain the sandbox asks for that is on neither the allow
  list nor the block list is judged; a pass is added to the allow list.
- **Active notes.** At rollover it can help weigh which notes stay in the next
  window's active set.

Each decision has its own panel setting - off, shadow (Jev is asked and its
answer logged, the plain rule still acts) or on - with a threshold and an
optional extra criterion. New decisions ship in shadow, so the log shows what
Jev would have done before it is trusted with anything.

When a question is about a conversation, Jev reads it through one shared
builder: the recent messages in order, plus - where the question is about the
assistant's own speech - what the assistant recently said there. The slice is
bounded to about 6 000 tokens of Jev's 32 000-token window: the oldest whole
messages are dropped first, a message is never cut in half, and the state
records how many were dropped. Every request is scrubbed of secret values before
it leaves, and the questions that judge nearby context read no persona.

## Compared with other projects

The facts below come from each project's own documentation, linked at the end of
this page, as of 2026-10-26.

| Project | What it is | Context windows | Long-term memory |
| --- | --- | --- | --- |
| **personal-bot** | a self-hosted assistant for one chat account | rotating windows with a token budget, staged reminders, rollover with a written handoff; old windows stay searchable | notes written by the assistant, with summaries, a token budget and a stack-picked active set |
| [AstrBot](https://github.com/AstrBotDevs/AstrBot) | a chatbot framework for many IM platforms | per-conversation context, compressed automatically at 82 % of the model's window: drop whole rounds (the default), or an LLM summary that keeps the newest 15 % | none built in; a knowledge base holds documents for retrieval, and group history can be injected |
| [MaiBot](https://github.com/Mai-with-u/MaiBot) | a chatbot framework aimed at group chat | a recent-message window whose older history is summarized by a dedicated model when it is trimmed | A-Memorix: vector, graph and BM25 retrieval over extracted memories, per chat stream by default |
| [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) | DeepSeek's open-source agent harness | an append-only session log the context is derived from; automatic compaction at 80 % of the routed model's window keeps the newest 16 % verbatim; oversized tool outputs are trimmed first | none built in; reference setups connect third-party memory servers over MCP |
| [pi](https://github.com/earendil-works/pi) | the TypeScript agent framework this bot builds on | a session stored as an append-only tree; automatic compaction near the limit summarizes older turns and keeps the newest 20 000 tokens; `/compact` on demand | project files (instructions, skills) are context; no chat memory of its own |

Two of these, pi and DeepSeek Harness, keep the raw session and replace older
spans with a summary in place. personal-bot instead opens a new window and keeps
the old one searchable: a rollover costs a cache miss, but the history is never
re-summarized and stays exactly as it happened. AstrBot and MaiBot compress a
single conversation and add a retrieval store on top - AstrBot's knowledge base,
MaiBot's A-Memorix - while personal-bot keeps its memory as notes the assistant
writes and cites. DeepSeek Harness is the only one of the five that leaves memory
entirely to plug-in MCP servers.

### Sources

- AstrBot: [context compression](https://docs.astrbot.app/en/use/context-compress.html),
  [knowledge base](https://docs.astrbot.app/en/use/knowledge-base.html),
  [configuration reference](https://docs.astrbot.app/en/dev/astrbot-config.html)
- MaiBot: [memory configuration](https://docs.mai-mai.org/en/manual/configuration/amemorix-config),
  [memory management](https://docs.mai-mai.org/en/manual/webui/memory-management),
  [model roles](https://docs.mai-mai.org/en/develop/llm-providers)
  (the repository moved from the MaiM-with-u organisation to Mai-with-u; the old
  address redirects)
- DeepSeek Harness: [compaction](https://deepseek-harness.github.io/deepseek-harness/en/reference/subsystems/compaction),
  [connecting a memory server](https://deepseek-harness.github.io/deepseek-harness/en/guide/mcp-memory),
  [product page](https://www.deepseek.com/en/harness/)
- pi: [sessions](https://pi.dev/docs/latest/sessions),
  [compaction](https://pi.dev/docs/latest/compaction)
