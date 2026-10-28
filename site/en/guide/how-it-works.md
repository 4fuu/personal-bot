# How it works

Each account runs as a single long-lived agent session that processes one turn
at a time. This page summarizes the core mechanisms; for the full walkthrough
and a side-by-side comparison with other projects, see
[docs/how-it-works.md](https://github.com/4fuu/personal-bot/blob/main/docs/how-it-works.md).

## What starts a turn

- **Messages:** A private message, or a group message that @mentions the
  assistant, replies to it, or uses its nickname, alias, or keyword, starts a
  turn according to that conversation's policy; unaddressed group messages can
  also start a turn when the assistant decides to join in.
- **Wake words:** When ending a turn quietly, the assistant can arm a few wake
  words in that conversation; for the next six hours, any message containing
  one of them starts a new turn.
- **Timed waits:** The assistant can pause and check back on a conversation
  after one minute to 24 hours; when the timer expires, a turn opens with the
  latest messages.
- **Scheduled tasks:** Configured in a system admin's private chat; each run
  opens a turn in the target conversation with the task's note as input.
- **Free turns:** When a configured number of minutes passes with no turn at
  all, the assistant gets a conversation-free turn of its own. Off by default;
  configure the interval on [Advanced settings](./console/advanced).

## Batching and joining in

Incoming messages in a chat are briefly batched before a turn starts: waiting
slightly longer while the same sender keeps typing, shorter when another sender
replies, at most one second on an @mention, and at most eight seconds overall.
In groups where proactive speaking is enabled, [Jev](https://typesafe.ai/)
scores whether joining the conversation is natural, and the host subtracts a
small penalty when the assistant has just spoken there (reduced slightly when
the batch @mentions it). After consecutive silent batches in a group, the next
join-in check backs off—holding messages without dropping them—until an
@mention, wake word, or message burst arrives. When multiple conversations are
waiting, the starvation guard serves long-waiting chats first, and Jev can
reorder the rest by urgency.

## One session, rotating windows

Working memory is a sequence of token-budgeted context windows rather than an
endlessly growing transcript, and windows rotate based on token usage rather
than turn counts. While a window is open, its prefix never changes, keeping the
model provider's prompt cache valid. As token usage rises, the host appends
staged reminders to update notes and write a four-part handoff; at the hard
limit, it rolls over automatically. Each new window opens with a fixed
orientation note, the handoff (when present), active note summaries, and recent
chat messages, while past windows and archived notes stay searchable through
tools.

## Notes: long-term memory

Notes are written and updated by the assistant itself; each note has a summary
of at most 200 characters and shares the window's token budget. At every
rollover, the host selects an active set—admin-pinned notes, notes written or
edited in the closing window, and the highest-scoring notes by decayed
usage—while archiving the rest for on-demand search. Notes are append-only and
anchored to the messages and actions they came from, so every revision stays
traceable to its source context. Browse them on [Memory](./console/memory).

## Jev: structured decisions and safety checks

[Jev](https://typesafe.ai/) is TypeSafe AI's decision model. It never writes
replies; instead, it answers structured yes/no probability questions (0–1) and
multi-level scoring questions (0–2) within hard bounds enforced by the host. It
is used for group join-in, reply timing, turn-queue ordering, quote decisions,
per-bubble outbound safety review, judging unknown domains requested by the
sandbox, and scoring candidate notes at rollover. Configurable decisions can be
set to **关闭** (off), **只记录不生效** (shadow: queried and logged while the
default rule acts), or **启用** (active) on their respective console pages.

## Comparison with other projects

For a comparison of context window and memory designs across `personal-bot`,
AstrBot, MaiBot, DeepSeek Harness, and `pi`, see the final section of
[docs/how-it-works.md](https://github.com/4fuu/personal-bot/blob/main/docs/how-it-works.md).
