# Memory

The memory page is the notes browser. Notes are written and edited by the
assistant itself and are its only long-term memory; each carries a summary of at
most 200 characters, and every list shows the summary, never the body - so
scanning many notes is cheap, and a body is read only when it is needed.

## The list and its filters

The toolbar holds the search box, the status filter (active / archived / all),
the visibility filter (open / private / secret) and more, with the advanced
filters as a disclosure at the end. Each row of the result list is one note:
title, summary, status, visibility, window. Clicking one opens its detail - the
body, the revision history including tombstones, and each revision's anchor
context: which message and turn it came from, which stretch of the conversation
it covers.

The filters and the open note ride in the URL, so a filtered list or one note can
be linked and reloaded. The 常驻 switch in the detail is the owner's handle:
a pinned note is in every active set whatever its usage score, and the assistant
has no way to set it itself.

## 设置: two limits

The 设置 popover in the page header holds two numbers; a change takes effect at
the next window:

| Setting | Default | What it is |
| --- | --- | --- |
| 活跃笔记上限 | 20 | the most active notes a new window keeps |
| 每窗口新笔记 | 10 | the most new notes one window may write |

The stack picks the active set as each window opens: the owner's pinned notes,
the notes written or edited in the closing window, then the rest by measured
usage. Everything else stays archived and searchable. The mechanism is on
[How it works](../how-it-works).
