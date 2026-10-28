# Safety

The **安全** page contains four cards covering system admins, outbound message
review, the sandbox's network allowlist and denylist, and recent blocked sends.

## 系统管理员 (System admins)

Only private-chat (`c2c`) friends can be added as system admins; people who
appear only in group chats cannot be selected. Messages from a system admin
carry operator authority: only an admin can assign real hands-on tasks or
authorize sharing a private fact in another conversation.

Click an admin's avatar chip to view their UID, the groups they belong to along
with their role in each (**群主** / **管理员** / **成员**), or to remove them.
**At least one system admin is required**—when the admin list is empty, the bot
starts no turns at all (while message mirroring and logging continue normally),
and removing the last admin asks for confirmation first. Because candidate
names are resolved through the driver, the page explains the cause if the
database key is missing or invalid rather than showing a blank list.

## 出口审查 (Outbound review via Jev)

Every outbound bubble is evaluated against the [Jev](https://typesafe.ai/)
questions below; if a question's probability reaches or exceeds its threshold,
the send is blocked and the assistant gets one chance to rewrite before giving
up. Click **更改** on any row to adjust its threshold, mode, or custom
criterion:

| Question | What it checks | Threshold | Default state |
| --- | --- | --- | --- |
| **泄露密钥** (Secret leak) | Whether the bubble exposes a complete API key, token, password, database key, or verification code | `0`–`1` | Always active (no mode toggle) |
| **没标引用** (Uncited claim) | Whether the bubble states a specific fact about a person or event not covered by its citations or recent chat context (common knowledge needs no citation) | `0`–`1` | **关闭** (Off) |
| **自我重复** (Self-repetition) | Whether the bubble repeats what the assistant just said in the same conversation | `0`–`1` | **只记录不生效** (Shadow) |

**没标引用** and **自我重复** can be switched between **关闭** (never asked),
**只记录不生效** (asked and logged without blocking sends), and **启用**
(actively blocks). Before setting **没标引用** to **启用**, try it in
**只记录不生效** and inspect its decisions on [Logs](./logs).

Two additional safety checks are enforced directly in host code before Jev is
called:

1. **Stored secret guard:** Any bubble containing the raw value of a secret
   workspace environment variable (or its Base64 / URL-encoded form) is
   rejected immediately in code.
2. **Cross-chat private citation guard:** Any send that cites a message or note
   marked **私聊学到的** (learned in private chat) or **机密** (secret) from
   another conversation (unless spoken by a system admin) is rejected by the
   host without a model call, so it needs no threshold row here.

## 网络 (Sandbox egress)

The bot's HTTP(S) egress proxy is the sandbox's only route to the internet.
Whenever a command in the sandbox requests a domain that is on neither list,
Jev judges it on the spot: allowed domains are saved to the **放行** (allow)
list, rejected ones to the **拦截** (deny) list, and requests made while Jev is
unreachable are denied and tagged **Jev 不可达**.

Click **管理** to open the domain lists modal. Each entry shows the domain,
its decision source (**Jev 判定**, **手动**, or **Jev 不可达**), the timestamp,
and the tool and command that triggered the lookup. From the modal you can add
a domain manually, move an entry between **放行** and **拦截** in one click, or
delete it. Note that **删除** forgets the entry rather than allowing it—the
next command that requests that domain will be judged by Jev again.

## 最近拦截 (Recent blocks)

Lists the three most recent outbound review blocks, with **查看全部** linking
to the filtered Jev review feed on [Logs](./logs).
