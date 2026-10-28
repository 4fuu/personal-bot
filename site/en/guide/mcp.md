# MCP client (OAuth)

The assistant can act as an MCP client and authenticate with external MCP
servers over OAuth 2.1. When an authorization server supports **Client ID
Metadata Documents** (CIMD), the `client_id` is simply the HTTPS URL of a JSON
document that the authorization server fetches to learn the client's name and
allowed `redirect_uris`. Because OAuth requires `client_id` inside the document
to match the exact URL the document was fetched from, each console origin needs
a matching document.

The three registration options below are listed in order of recommendation: the
first two use a metadata document URL, while the third requires no public
document at all.

## 1. Cloudflare Worker for any console origin (recommended)

[`cimd-worker/`](https://github.com/4fuu/personal-bot/tree/main/cimd-worker)
contains a zero-dependency Cloudflare Worker that embeds a caller-chosen ID and
your console's origin directly in the URL path:

```
https://personal-bot-cimd.popoi.work/<id>/http/localhost:8080/mcp-client.json
```

For a console accessed at `http://localhost:8080`, fetching that URL returns:

```json
{
  "client_id": "https://personal-bot-cimd.popoi.work/<id>/http/localhost:8080/mcp-client.json",
  "redirect_uris": ["http://localhost:8080/mcp/oauth/callback"]
}
```

Construct the URL from your `<id>`, the console's scheme (`http` or `https`),
its host and port, and `/mcp-client.json`. Because the callback path is always
`/mcp/oauth/callback`, putting the origin in the path lets one Worker serve any
console address.

- Generate `<id>` with `openssl rand -hex 16`: 16 to 64 characters of
  `A-Z a-z 0-9 _ -`, containing at least one letter and one digit.
- **Keep using the same ID afterwards**: it is part of the `client_id`
  registered on the MCP server, so changing it registers a new client.
- Giving each deployment its own `<id>` prevents two users who both open their
  consoles at `http://localhost:8080` from registering the same `client_id` on
  a shared MCP server.
- Any valid `http` or `https` host (including `localhost` and loopback IPs) is
  served; malformed schemes, hosts, paths, or IDs are rejected with `400`.

To deploy your own copy of the Worker instead of using the shared instance:

```sh
cd cimd-worker
CLOUDFLARE_API_TOKEN=<token-with-workers-deploy-permission> npx wrangler deploy
```

The Worker has no dependencies and no build step.

## 2. Static `mcp-client.json` on GitHub Pages

The repository includes a static
[`mcp-client.json`](https://github.com/4fuu/personal-bot/blob/main/mcp-client.json)
published at the root of the documentation site:

```
https://4fuu.github.io/personal-bot/mcp-client.json
```

Its contents are fixed to `http://localhost:8080`:

```json
{
  "client_id": "https://4fuu.github.io/personal-bot/mcp-client.json",
  "redirect_uris": ["http://localhost:8080/mcp/oauth/callback"]
}
```

**Requirement:** You must open the console at `http://localhost:8080` in your
browser. If you reach the console through a different address—a custom domain, a
tunnel, or another port—the browser's callback URL will not match
`http://localhost:8080/mcp/oauth/callback` and the authorization server will
reject the flow. In that case, either use the Worker above or fork the
repository, edit `client_id` and `redirect_uris` in `mcp-client.json`, and let
GitHub Pages publish your copy.

## 3. Registering without a metadata document

If you prefer not to use a public metadata URL, the [Workspace](./console/workspace)
page supports two other OAuth client registration modes:

- **动态注册** (dynamic client registration): registers the client automatically
  with the authorization server (requires RFC 7591 support on the server).
- **预先注册的 client id** (pre-registered client ID): uses a client ID and
  optional client secret that you registered manually on the MCP server.

## Authorizing a server in the console

1. On the [Workspace](./console/workspace) page, add or edit an MCP server in
   the **MCP 服务器** card, set **认证** to **OAuth 2.1**, and set **客户端注册**
   to **客户端元数据文档（CIMD）**, **动态注册**, or **预先注册的 client id**.
2. Click **授权** on the server's row. The console opens the authorization
   server's sign-in page using the browser's current origin as the callback
   origin, so reverse proxies do not cause a redirect mismatch.
3. After you approve access, the authorization server redirects back to
   `/mcp/oauth/callback` on the console, which forwards the authorization code
   to the bot to exchange for tokens.

Tokens are stored in the bot's database and are never exposed to the browser. As
long as a valid access token or refresh token is stored, the server stays marked
**已授权** and refreshes short-lived access tokens automatically. Servers using
the `stdio` transport run inside the sandbox and cannot use browser-based OAuth.
