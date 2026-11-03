# Schedules

The **定时** page lists every scheduled task in chronological order, and the
owner creates, edits, pauses, resumes and deletes them here. A task has two
possible authors: the assistant sets one from a script during a turn in a
system admin's private chat (citing a message from that admin), and the owner
writes one straight from this page - both over exactly the same fields. Each row
says whether the task was written by **模型** (the model) or **管理员** (the
owner): the model may read and change its own tasks, and may not change the
owner's.

Each row shows the target conversation name, the task ID with its author, the
next scheduled run time (a paused task is marked **已暂停**), the repeat rule in
plain text (such as `仅一次` for a one-off task, or interval, weekdays, and end
date for a recurring one), the number of runs remaining, the task note passed
into the turn when it fires (click to view the full text in a popover), and the
outcome of its last run:

- **已触发** (Ran): the scheduled turn started normally (with the run timestamp
  shown beside it).
- **已跳过** (Skipped): the occurrence was skipped because of the conversation's
  policy or because the bot was offline for more than the one-hour catch-up
  window, with the reason shown beside the pill (for example `说话方式为不说话`).
- **未触发** (Not yet run): the task has not reached its first scheduled time.

Three actions sit at the right end of each row: **编辑** opens a form over the
target conversation, the trigger time, the repeat rule and the note; **暂停** /
**恢复** acts at once (a paused task keeps its scheduled time and simply never
fires until it is resumed); and **取消** asks for a confirmation in the row's
own popover. The task is deleted immediately while any past turns it already
triggered remain in the logs.

**新建任务** at the end of the list opens the same form. The target conversation
defaults to the first system admin's private chat and otherwise offers the
conversations the policy allows; the trigger time is a local date-time in the
bot's own timezone; and the repeat rule covers minutes, hours, days, weeks and
months (never shorter than ten minutes), optionally limited to certain
weekdays, a number of runs, or an end date. The form checks those rules itself,
so **保存** stays disabled until the task is one the bot would accept.

Short-term timed waits (where the assistant pauses for one minute to 24 hours
to check back on a conversation, up to ten times in a row) are separate from
scheduled tasks and do not appear on this page.
