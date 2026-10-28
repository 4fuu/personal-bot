# Schedules

The schedules page lists the timed tasks, read and cancel only - the tasks are
written by the assistant itself from a script in an admin's private chat, and
nothing here creates or edits one.

One row per task: the conversation it fires in, when it is next due, its repeat
rule, the note its turn carries, and what its last run did.

- **已触发** (ran): that turn started.
- **已跳过** (skipped): the occurrence was dropped by the conversation policy or
  the catch-up rule, with the reason beside it (for example "说话方式为不说话").
- **未触发** (not yet): before the task's first run.

The repeat rule shows the interval and weekdays, the runs left and the stop time;
a one-off task has none of these. To stop a task, cancel it - that turn simply
never comes, and nothing else changes.

A `wait` (one minute to one day) is not here: that is the assistant saying "look
again in a while" inside a turn, at most ten in a row, and it survives a restart.
