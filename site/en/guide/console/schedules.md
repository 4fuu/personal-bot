# Schedules

The **定时** page lists all active scheduled tasks in chronological order. The
page is read- and cancel-only: scheduled tasks are created and updated by the
assistant itself from a script during a turn in a system admin's private chat
(citing a message from that admin), rather than through a form in the console.

Each row shows the target conversation name and task ID, the next scheduled run
time, the repeat rule in plain text (such as `仅一次` for a one-off task, or
interval, weekdays, and end date for a recurring one), the number of runs
remaining, the task note passed into the turn when it fires (click to view the
full text in a popover), and the outcome of its last run:

- **已触发** (Ran): the scheduled turn started normally (with the run timestamp
  shown beside it).
- **已跳过** (Skipped): the occurrence was skipped because of the conversation's
  policy or because the bot was offline for more than the one-hour catch-up
  window, with the reason shown beside the pill (for example `说话方式为不说话`).
- **未触发** (Not yet run): the task has not reached its first scheduled time.

To cancel a task, click **取消** at the right end of its row and confirm with
**确认取消** in the popover. The task is deleted immediately while any past
turns it already triggered remain in the logs.

Short-term timed waits (where the assistant pauses for one minute to 24 hours
to check back on a conversation, up to ten times in a row) are separate from
scheduled tasks and do not appear on this page.
