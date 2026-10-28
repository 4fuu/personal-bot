# Stickers

The **表情包** page displays the stickers the assistant holds in its own store,
organized into two tabs:

- **最近使用** (Recently used): up to 27 stickers the assistant has sent most
  recently, newest first. Sending a sticker again moves it to the front; when a
  28th is added, the oldest entry drops out.
- **已保存** (Saved): up to 500 stickers the assistant saved on its own
  initiative when seeing them in chat, each paired with a short text
  description for search (if the list is full, the least-used saved sticker is
  evicted).

Each tile in the grid shows the sticker preview, its description (or shortened
MD5), and how many times it has been sent. Clicking a tile opens a popover with
its full `md5` handle, description, usage count, and a remove button:

- In **最近使用**, **删除** removes the sticker from the recent list.
- In **已保存**, **取消保存** removes it from the saved list.

The underlying image file stays on disk as long as either list still references
it, so unsaving a sticker that is still in **最近使用** leaves it available to
send until it ages out of the recent list.

There is no manual upload or sticker-pack import in the console—the assistant
collects and saves stickers itself from conversations it is allowed to read.
