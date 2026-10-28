# Logs

The **日志** page offers two views over the runtime logs, selected by the first
dropdown in the toolbar and reflected in the URL hash:

- **按轮次** (By turn): groups records into one expandable block per turn. Each
  turn header shows the timestamp, the conversation name (or **空闲轮** for a
  free turn), the trigger summary, and one-line totals for the join-in check,
  tool calls, sent bubbles, token usage, and duration. Expanding a block shows
  every step of the turn in chronological order: rendered input, model output,
  tool calls with arguments and results, Jev decisions, and per-bubble send
  outcomes.
- **列表** (Flat list): displays a newest-first stream of individual log entries
  across **驱动** (driver), **机器人** (bot), and **控制台** (console).

Both views can be filtered by conversation and by turn. Switching to **列表**
unlocks filters for record kind (**全部类型**, **Jev**, **发送**, **轮次**,
**助手**, **工具调用**, **工具结果**, **写笔记**, **改笔记**, **删笔记**,
**轮换**, **提醒**, **错误**, **系统**), source (**驱动**, **机器人**,
**控制台**), level (`action`, `info`, `error`), and free-text search.

## What a turn trajectory shows

- **Tool calls and nested scripts:** Each tool call is paired with its result in
  a single step showing the arguments, output text (texts longer than 400
  characters collapse behind **展开全文**), and duration. For `code_exec`
  steps, every nested tool call made inside the script is listed underneath
  with its own status (**成功** or **失败**) and duration.
- **Token usage and bubble states:** Model steps show input, output, and
  cache-read token counts. Send steps list each bubble alongside its delivery
  status (**已发出** / **排队中** / **没发出去** / **未尝试**), updating live as
  the driver reports completion.
- **Jev decisions and group join-in breakdown:** Jev steps show the probability
  for each question, and decisions in **只记录不生效** (shadow) mode include a
  note explaining what action would have been taken if enabled. Group join-in
  evaluations are attached directly to the turn's opening step, showing the
  **插话意愿** probability, **扣分** (penalty), final **得分** (score), **阈值**
  (threshold), and **上限** (penalty ceiling), the four penalty factors
  (**刚回复过**, **我说得多**, **话痨度低**, **时段安静**), and summary counts of
  the context Jev saw (recent message count, omitted older messages, recent
  share of talk, others' messages in the last five minutes, and minutes since
  last reply—counts only, never raw chat text). Batches delayed by idle backoff
  are logged with the applied backoff duration.

The page refreshes automatically while open; after a restart, it seeds recent
history from the bot and deduplicates entries by ID. Console-level events
(sign-ins, sticker deletions, driver errors, live-view connections) appear in
the same feed under source **控制台**.
