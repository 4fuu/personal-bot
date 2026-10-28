# How it works

The assistant is one long-running agent with a single session per account,
working one turn at a time. This page is the mechanism overview; the full detail
is the repository's
[docs/how-it-works.md](https://github.com/4fuu/personal-bot/blob/main/docs/how-it-works.md)
and this page links to it rather than repeating it.

## What starts a turn

- **Messages.** A private message, or a group message that @s the assistant,
  replies to it or names it, starts a turn according to that conversation's
  policy; other group messages may start one when it decides to join in.
- **Wake words.** When it ends a turn quietly, it can arm a few words; for six
  hours, any of them in that conversation starts a new turn.
- **`wait`.** It can say "look again in a while", from one minute to one day;
  when the time comes the conversation reopens with its newest messages.
- **Scheduled tasks.** Set in an admin's private chat, each opening a turn in a
  chosen conversation with the task's note as its input.
- **Free turns.** When a set number of minutes passes with no turn at all, it
  gets a turn of its own that belongs to no conversation. Off by default; the
  interval is set on [Advanced](./console/advanced).

## One batch, one decision

Messages are collected briefly first: longer while the same person keeps typing,
shorter when someone else answers, at most a second when it is @'d, never more
than about eight seconds for a whole batch. In a group, Jev scores whether
joining in is natural; the stack subtracts a small penalty when it has just been
talking, a little less when the batch @s it. After a few batches in a row where
it stayed out, the next check waits longer - messages are held, not dropped. When
several conversations are waiting, the one that has waited too long goes first,
and Jev may reorder the rest by urgency.

## One session, rotating windows

The working memory is not one transcript that grows forever. It is a sequence of
context windows, each with a token budget, and a window is replaced when tokens -
never a turn count - say so. While a window is open its beginning never changes,
which keeps the model provider's prompt cache valid. As a window fills, the stack
sends staged reminders that ask it to write notes and prepare a handoff; at the
hard limit the stack rolls over by itself. A new window opens with a fixed opening
note, the active notes, the handoff and the chat's recent messages; the previous
window is not replayed, but its notes, its own history and the chat log all stay
reachable.

## Notes: the only long-term memory

Notes are written by the assistant itself; each carries a summary of at most 200
characters and a share of the token budget. Every new window keeps an active set
- the pinned notes, the notes written or edited in the closing window, then the
rest by measured usage - and everything else stays archived and searchable. Notes
are append-only and anchored to the messages and actions they came from, so a note
keeps pointing at its sources after it is edited. Browse them on
[Memory](./console/memory).

## Jev: yes/no judgments

[Jev](https://typesafe.ai/) is TypeSafe AI's decision model.

Jev never writes replies; it answers short yes/no questions with a probability,
and the stack compares that against a threshold. It is used for joining in, reply
timing, quoting, queue order, the review of every outbound bubble, the network
gate for a domain on neither list, and which notes stay active at rollover. Each
decision has its own mode - off, shadow (asked and logged, the plain rule still
acts) or on - and a new decision ships in shadow.

## Compared with other projects

The side-by-side comparison of the context handling (AstrBot, MaiBot, DeepSeek
Harness and pi) is the last part of
[docs/how-it-works.md](https://github.com/4fuu/personal-bot/blob/main/docs/how-it-works.md).
