# Troubleshooting

| Symptom | What it means |
| --- | --- |
| `error: no QQ source: set exactly one of ...` | neither `QQ_DEB_URL` nor a mounted deb was given; see [First start](./first-start) |
| `error: sha256 mismatch: expected ... got ...` | the deb is not the pinned build; get the right file |
| `error: both QQ_DEB_URL and the mounted deb ... are set` | remove one of the two |
| The live view stays on the QR code | that is correct: a QR login is manual and yours to do |
| `db.key = "missing"` | the key extraction has not finished. The log is `./logs/keyx.log` on the host (`/out/keyx.log` inside the container). The driver keeps watching, so the status turns to `"ok"` on its own once the key lands |
| `db.key = "invalid"` | the client changed its key, or the private copy no longer matches. Follow the re-extract steps on the QQ page |
| The panel's pages answer 502 | the driver or the bot is not up yet; check `docker compose logs qq bot` |
| The bot starts no turn at all | look at 概览's 待处理 first: at least one admin and one conversation in the allow list are both required |
| Not one message goes out | the outbound review fails closed when Jev is unreachable. Check its state on [Models](./console/models) and set the key |
| The sandbox cannot install a skill or reach a source | the domain is not on the allow list. Look at 网络 on [Safety](./console/safety); deleting a wrong entry makes it judged again |
| A persona edit changed nothing | identity takes effect at the next window, or use 立即轮换 on the page |

## Where the logs are

- The panel's [Logs](./console/logs) page: driver, bot and panel events,
  filterable and live.
- `./logs/` on the host: the `qq` container's own diagnostics, which **may contain
  chat content** - do not share them.

## Still stuck

Bring these when you ask: the image tag (`PERSONAL_BOT_TAG` or `latest`), the
output of `docker compose ps`, the tail of `./logs/qq.log` and `./logs/keyx.log`
with chat content removed, and a screenshot of the panel's [概览](./console/)
(mock data is fine too).
