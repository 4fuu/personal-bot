# Models and Jev

Because the assistant is built on [pi](https://pi.dev), **every provider and
model supported by pi is available**. This page manages four cards: the main
model and its thinking level, the Jev API key, LLM provider logins, and web
search providers.

## 主模型 (Main model)

The model list is loaded from pi's agent directory (combining built-in models,
the `pi.dev` catalog, and any custom `models.json`). The catalog is fetched at
bot startup and refreshed automatically once a day (unless `PI_OFFLINE=1`);
clicking **刷新目录** in the page header refreshes it on demand.

Clicking the current model chip opens a searchable modal over the full catalog.
**The main model must support vision input**, as image understanding and sticker
selection rely on it; models without vision remain visible in the list with a
**不支持视觉** badge and cannot be selected. Next to the chip, the **思考**
dropdown sets the model's reasoning effort (`关闭`, `minimal`, `low`, `medium`,
`high`, `xhigh`, `max`) and takes effect immediately.

## Jev（出口审查）

[Jev](https://typesafe.ai/) is TypeSafe AI's decision model. It never writes
replies; instead, it answers structured yes/no probability questions (0–1) and
multi-level scoring questions (0–2)—covering group join-in, reply timing, quote
decisions, turn-queue ordering, per-bubble outbound safety checks, unknown
sandbox domains, and candidate note scoring at rollover. Because every outbound
message passes through Jev review, if Jev has no key or cannot be reached,
**outbound review fails closed and no messages are sent**.

This card shows Jev's status (**正常** / **未设置 key** / **调用失败**) and a
**设置 key** / **更换 key** button. The API key is write-only: it is stored on
the bot side and never returned to the browser or written to logs.

The mode, threshold, and custom criterion for each configurable Jev decision
live on the page for that feature: **回复时机** and **引用** on
[Conversations and policies](./conversations), **需要程度** (queue ordering) on
[Advanced settings](./advanced), and **出口审查** on [Safety](./safety).

## 服务商 (LLM login)

Lists every model provider registered in pi along with its supported login
flows (`OAuth` or `API key`). Logged-in providers appear first, with the first
15 shown inline and the rest searchable via the **更多** modal. Starting a login
relays pi's interactive prompts (authorization URLs, device codes, or API key
inputs) over a WebSocket and stores the resulting credentials exclusively on
the bot side. Providers that only read ambient
environment variables display pi's setup hint below the row.

## 搜索服务商 (Search providers)

Configures the providers used by the web-search and page-fetch tools (currently
DeepSeek and Parallel). Keys are write-only here as well. Click the active
provider chip at the top of the card to choose which logged-in provider to use;
if only one search provider is logged in, the assistant uses it automatically
even before an explicit selection is saved (the card notes this alongside the
chip).

DeepSeek shares its API key with the LLM provider login above: signing in or
logging out on either card updates both at the same time.
