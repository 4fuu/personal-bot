# Safety

Four cards: who may command it, what the outbound review asks, which domains the
sandbox may reach, and what was blocked recently.

## 系统管理员: system admins

An admin can only be a private-chat (c2c) friend; what an admin says counts as
the owner speaking. Click an avatar for its details - uid, the groups it is in
with its role in each, and remove. **At least one admin is required**, or the bot
starts no turn at all (messages are still mirrored and the log still advances).
The candidate list resolves names through the driver, so the page explains itself
when the key is missing or invalid instead of showing an empty list.

## 出口审查: the outbound review (Jev)

Every outbound bubble passes these questions; a probability above the threshold
blocks it. Click a row to change its threshold and extra criterion; the question
text itself lives in the bot's code and is shown read-only. The console is in
Chinese, so each row's own label is given beside it.

| Question (console label) | What it checks | Threshold |
| --- | --- | --- |
| leaks a secret (泄露密钥) | whether it would say a whole secret, token, password or code | 0-1 |
| uncited private fact (没标引用) | naming a specific thing or person without a citation (common knowledge needs none) | 0-1 |
| repeats itself (自我重复) | whether it repeats what it just said in this conversation | 0-1 |

Each row also has a mode: 关闭 (never asked), 只记录不生效 (asked and logged,
refuses nothing) or 启用 (refuses inside the rule's bounds). 泄露密钥 is always
asked, 自我重复 ships in 只记录不生效, and 没标引用 is off by default - before
turning it on, read what it would have blocked in [Logs](./logs).

One check is not here: passing on a cited fact marked private or secret from
another chat is refused by the host itself, with no model call, so it has no row
and no threshold.

## 网络: the sandbox's egress

The sandbox's only route out is the bot's egress proxy. A domain on neither list
is judged by Jev on the spot: a pass is added to the allow list, a fail to the
deny list, and an unreachable Jev denies. The card shows how many entries each
list holds; 管理 opens them - domain, decision, when it was added and, for a
judged one, the command and tool that asked.

There are three sources: judged by Jev, set by hand here, and denied by default
because Jev was unreachable - the last is a domain the agent may legitimately
need, one click from 放行.

Deleting is not allowing: after a delete, the next command that asks for the
domain is judged again.

## 最近拦截: recent blocks

The last three blocked bubbles; 查看全部 jumps to the filtered review records in
[Logs](./logs).
