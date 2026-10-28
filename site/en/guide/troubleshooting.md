# Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `error: no QQ source: set exactly one of ...` | Neither `QQ_DEB_URL` nor a mounted `/qq/QQ.deb` was provided; see [First start and QR login](./first-start) |
| `error: sha256 mismatch: expected ... got ...` | The `.deb` file does not match the pinned client build; use the exact pinned version |
| `error: both QQ_DEB_URL and the mounted deb ... are set` | Both package sources are configured; remove one of them |
| Live view stays on the QR code screen | Normal on first login—scan the QR code with the mobile QQ app |
| Sidebar shows **密钥缺失** | Database key extraction is still running; check `./logs/keyx.log` on the host (`/out/keyx.log` in the container). The driver keeps watching and switches to **密钥正常** automatically once the key lands |
| Sidebar shows **密钥失效** | The client rotated its database key or the decrypted copy no longer matches; follow the re-extraction steps shown in the banner on the **QQ** page |
| Console pages return `502` | The `qq` or `bot` container is still starting up; check `docker compose logs qq bot` |
| The bot never starts a turn | Check **待处理** on [Overview](./console/): at least one system admin and at least one conversation set to **参与** are both required before any turn can start |
| Outbound messages are all blocked | Outbound review fails closed when Jev is missing a key or unreachable. Check the **Jev（出口审查）** card on [Models and Jev](./console/models) and set a valid API key |
| Sandbox commands cannot install a skill or reach a host | The target domain is blocked by the egress proxy. Open **网络** on [Safety](./console/safety) to move the domain to **放行** (or delete the entry so the next request is judged again) |
| Persona edits have not taken effect | The system prompt is frozen for the life of the current context window; edits apply at the next rollover, or immediately at the next turn boundary if you click **立即轮换** in the page header |

## Where logs live

- **[Logs](./console/logs) page in the console:** Live, filterable feed of
  driver actions, bot turn trajectories, Jev decisions, and panel events.
- **`./logs/` on the host:** Low-level diagnostics from the `qq` container
  (`qq.log`, `keyx.log`, `novnc.log`). **These files may contain chat text**—do
  not share them publicly without redacting personal data.

## Reporting an issue

When asking for help, include the image tag (`PERSONAL_BOT_TAG` or `latest`),
the output of `docker compose ps`, the tail of `./logs/qq.log` and
`./logs/keyx.log` with all chat content and account identifiers removed, and a
redacted or mock-mode screenshot of the console's [Overview](./console/) page.
