# Models and Jev

The agent is built on [pi](https://pi.dev), so **every provider and model pi
supports is available**: log a provider in, or add a key, right here on the models
page. The page holds three things: which model is the main one, Jev's key, and
which provider search uses.

## 主模型: the main model

The model catalog comes from pi's agent directory (the built-ins, the pi.dev
catalog, your own `models.json`) and is fetched at bot start, unless
`PI_OFFLINE=1`; the 刷新目录 action in the page header fetches it again on demand.
One chip shows the current main model and opens a searchable list. The main model
**must support vision**: image understanding and sticker selection both rely on it.
A model without vision stays listed and disabled with the reason. The 思考 select
beside the chip picks the thinking level (off, minimal, low, medium, high, xhigh,
max).

## Jev（出口审查）

Jev is a second, smaller and faster model. It never writes replies; it answers
yes/no questions with a probability: whether to join in, how long to wait before
answering, whether to quote, which conversation goes first, whether a bubble may
leave, whether a domain may be reached, which notes stay. Every outbound bubble
passes it, so when it is unreachable the privacy check **fails closed and not one
message is sent**.

This card shows its state (ok / missing / error) and the 设置 key / 更换 key
button. The key is write-only, stored on the bot's side, and never returned to the
browser.

The mode, threshold and extra criterion of each of its decisions live on their own
pages: 回复时机 and 引用 on [Conversations](./conversations), 排队 on
[Advanced](./advanced), 出口审查 on [Safety](./safety). A new decision ships in
只记录不生效 - the log shows what it would have done before it is trusted with
anything.

## 服务商: LLM login

Every provider pi registers, with the flows pi defines for it. Clicking one
starts pi's own login; the browser only relays pi's prompts, stores nothing, can
cancel mid-flow and can log out. Providers with no interactive flow are
configured in the bot container's environment, as pi's own note says.
Credentials are stored on the bot's side.

## 搜索服务商: search providers

Web search and page reading go through here, keys write-only as well. Which
provider is active is picked in the card, exactly like the main model; with only
one logged in there is nothing to pick and the bot uses it (the page says
未选用 and why). DeepSeek shares its key with the model login above: logging in
on either side logs in both, and logging out does the same.
