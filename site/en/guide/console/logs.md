# Logs

The logs page is two views over the same records, chosen by the toolbar's first
control and kept in the URL:

- **按轮次** (by turn): one turn reads as one trajectory - its own record opens
  it (the chat input it rendered and why the turn started: mention, join_in,
  wait, schedule, free), and its steps follow in append order. The list answers
  newest first, so one trajectory is read from its end backwards.
- **列表** (list): the flat feed, newest first.

Filters by kind (turn, assistant, tool_call, tool_result, send, note_write,
note_replace, note_delete, rollover, reminder, jev, error, system), by source
(driver, bot, console), by conversation and by turn.

One tool call and its result read as one step, with the arguments, the result and
the duration; a `code_exec` result also lists each nested call its script made
with its status - the only place a nested call's outcome lives. A model call's
token use rides on its own step. A send record lists its bubbles with the state
the driver reported for each (sent, queued, failed, not_attempted), completed as
the driver reports them.

A jev record carries its probabilities, and a decision that ships in shadow also
carries what it would have done. The join-in gate rides on the turn's own record:
the probability, the penalty with its factors (a recent reply, how much of the
talk was mine, low talkativeness, a quiet time of day), the threshold, the score
and the decision in the bot's own words. A batch held by the idle backoff has its
own record with the backoff that was applied.

Entries stream in live; after a restart the recent history is seeded once from the
bot and the stream resumes, de-duplicated by record id. The panel's own events -
logins, sticker deletes, driver errors, live-view sessions - are folded into the
same list with source console.
