# MCP client (OAuth)

The assistant can act as an MCP client, and an MCP server that authenticates over
OAuth can register it by **Client ID Metadata Document** (CIMD): the `client_id`
is the URL of a JSON document, and the authorization server fetches it to learn
the client's redirect URIs and its name. The `client_id` has to be the exact URL
the document was fetched from, so one document describes one console address.

The three ways below are in order of recommendation. The first two answer "where
does the document live"; the third needs no published document at all.

## 1. A Worker: one address for every console address (recommended)

[`cimd-worker/`](https://github.com/4fuu/personal-bot/tree/main/cimd-worker) holds
a Cloudflare Worker that puts an id of your own and the console's address in the
path:

```
https://personal-bot-cimd.popoi.work/<id>/http/localhost:8080/mcp-client.json
```

is the document for a console reached at `http://localhost:8080`:

```json
{
  "client_id": "https://personal-bot-cimd.popoi.work/<id>/http/localhost:8080/mcp-client.json",
  "redirect_uris": ["http://localhost:8080/mcp/oauth/callback"]
}
```

Build the URL from **an id of your own** and the address you open the console at:
the id, the console's scheme, host and port, then `/mcp-client.json`. The console's
callback path is fixed (`/mcp/oauth/callback`); only the origin varies, so the
origin rides in the path.

- Make the id with `openssl rand -hex 16`: 16 to 64 characters, `A-Z a-z 0-9 _ -`,
  at least one letter and one digit.
- **Keep using the same one afterwards**: it is part of the `client_id` the MCP
  server registered, so a new id is a new client there.
- Two people whose consoles sit at the same origin - both on
  `http://localhost:8080`, say - each pick their own id, or they would register
  the same `client_id`.
- Any origin is served, loopback included; only malformed input - a bad scheme, a
  segment that is not a host, the wrong path, an id that breaks its rules - is
  refused with a 400.

Deploy your own if you would rather not depend on the one above:

```sh
cd cimd-worker
CLOUDFLARE_API_TOKEN=<a token that may deploy Workers> npx wrangler deploy
```

The Worker has no dependencies and no build step.

## 2. The static file: mcp-client.json on GitHub Pages

The repository ships that document as
[`mcp-client.json`](https://github.com/4fuu/personal-bot/blob/main/mcp-client.json),
and the docs site publishes it at the site root, so its address is:

```
https://4fuu.github.io/personal-bot/mcp-client.json
```

Its content (`client_id` is the URL it is served from):

```json
{
  "client_id": "https://4fuu.github.io/personal-bot/mcp-client.json",
  "redirect_uris": ["http://localhost:8080/mcp/oauth/callback"]
}
```

**Assumption:** you reach the console at `http://localhost:8080`. If you reach it
at another address - a domain, a tunnel, another port - the static file is the
wrong tool, because `client_id` has to be the exact URL the document is fetched
from: either use the Worker above, or edit `redirect_uris` in your copy to match
the address the browser used exactly, because the authorization server refuses a
callback that does not match.

## 3. Publishing nothing at all

If you would rather not publish anything, the other two ways are both on the
panel's [Workspace](./console/workspace) page:

- **Dynamic client registration** (`dynamic`), which the authorization server has
  to support.
- **A client id and secret registered by hand** (`static`) on the MCP server.

## Authorizing in the console

All three ways hand you the same thing: a `client_id` (the Worker's URL, the Pages
URL, or the pair you registered by hand). Then:

1. Add or edit the MCP server on the [Workspace](./console/workspace) page, pick
   OAuth for its auth and one of 元数据文档 / 动态注册 / 手工登记 for the client
   mode.
2. Press 授权: the panel opens the authorization server's URL with the redirect it
   computed - the browser's own origin, not the console server's `Host`, which
   differ behind a proxy.
3. The authorization server sends the browser back to the console's own
   `/mcp/oauth/callback`, the console hands the code to the bot, and the tokens
   land in the bot's store.

The tokens stay on the bot's side and the browser never sees one; a stored refresh
token counts too, so a server you authorized once keeps reading 已授权. A stdio
server cannot be authorized this way - there is no browser inside the sandbox to
come back to - and is refused with that reason.
