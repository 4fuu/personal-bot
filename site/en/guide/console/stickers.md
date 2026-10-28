# Stickers

The stickers page shows the bot's own stickers: two tabs, one list each.

- **最近使用** (recent): the 27 most recently used, newest first.
- **已保存** (saved): the ones it kept when it saw one it liked, at most 500,
  each with a description.

Clicking a tile opens a popover with its md5, its use count and the delete. In
已保存 the delete is 取消保存 - the bytes stay while any list still claims them,
so after unsaving, a sticker that is still in 最近使用 remains sendable.

There is no upload, no import and no settings: it saves a new sticker itself,
with a tool, when it sees one in chat.
