# Memory

The **记忆** page is the browser for the assistant's notes. Notes are written
and updated by the assistant itself and serve as its long-term memory; each
note carries a one-line summary of at most 200 characters that the assistant's
search results and window bootstrap display in place of the full body.

## Searching, filtering, and inspecting notes

The toolbar at the top provides **全文搜索** (full-text search over titles and
bodies), **状态** (**全部** / **活跃** / **已归档**), and **可见性** (**全部** /
**公开** / **私聊学到的** / **机密**), plus an **高级筛选** disclosure for
filtering by **关于** (`self`, `person:uid`, or `conv:id`), **窗口** (for example
`w37`), and **反链** (backlinks such as `msg:7698...`). Directly below the
toolbar, a single line shows the most recent note operation with a link to the
logs.

Each row in the result list shows the note's title, status badge (**活跃**,
**已归档**, or **已删除**), an optional **常驻** badge, its visibility badge,
and its anchor timestamp. Selecting a row opens the detail pane beside the list:

- **常驻 (Pinned) switch:** Located in the detail header. Notes marked **常驻**
  are included in every new window's active set regardless of usage score. Only
  an admin can toggle this switch in the console; the assistant has no tool to
  set or clear it.
- **摘要 (Summary) and 内容 (Content):** Shows the latest revision's one-line
  summary and full body (deleted notes show a tombstone notice while preserving
  all prior revisions below).
- **修订历史 (Revision history):** Lists every revision of the note, with a
  **详情（锚点 / 来源 / 反链）** disclosure showing the window, event record,
  conversation, chat cursor, message range, and cited evidence for that
  revision.
- **锚点上下文 (Anchor context):** Clicking **查看上下文** on any revision loads
  the surrounding history records, chat messages around the cursor, cited
  evidence messages, and summarized message range; every reference chip is
  clickable.

Active filters, the selected note ID, and the open revision number are all
reflected in the URL hash, so any filtered view or specific note revision can
be bookmarked or reloaded.

## 设置 (Settings): note limits

Clicking **设置** in the page header opens a popover with two limits:

| Setting | Default | Meaning |
| --- | --- | --- |
| **活跃笔记上限** (Max active notes) | `20` | Maximum number of active notes carried into each new context window |
| **每窗口新笔记** (New notes per window) | `10` | Maximum number of new notes the assistant may create in a single window (editing existing notes does not count) |

At each rollover, the host builds the new window's active set from admin-pinned
(**常驻**) notes, notes written or edited in the closing window, and the
highest-scoring remaining notes by decayed usage (up to the count cap and 15 %
of the window's tokens). All other notes are archived and remain searchable.
See [How it works](../how-it-works) for details.
