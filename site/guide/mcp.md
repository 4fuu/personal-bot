# MCP 客户端（OAuth）

模型可以作为 MCP 客户端。一个用 OAuth 认证的 MCP 服务端可以通过
**Client ID Metadata Document**（CIMD）注册它：`client_id` 是一个 JSON 文档的 URL，
授权服务器会去取这个文档，从而知道客户端的跳转地址和名字。
`client_id` 必须与文档被取用时的 URL 完全一致，所以一份文档只能对应一个面板地址。

下面三种办法按推荐顺序排列。前两种解决"文档放哪"，第三种根本不需要发布文档。

## 一、Worker：一个地址服务所有面板地址（推荐）

仓库里的 [`cimd-worker/`](https://github.com/4fuu/personal-bot/tree/main/cimd-worker)
是一个 Cloudflare Worker，它把面板的地址和一个你自己起的 id 一起放进路径：

```
https://personal-bot-cimd.popoi.work/<id>/http/localhost:8080/mcp-client.json
```

就是面板在 `http://localhost:8080` 时的那份文档：

```json
{
  "client_id": "https://personal-bot-cimd.popoi.work/<id>/http/localhost:8080/mcp-client.json",
  "redirect_uris": ["http://localhost:8080/mcp/oauth/callback"]
}
```

URL 由 **id** 和你打开面板时用的地址拼成：id、面板的协议、主机和端口，
再接 `/mcp-client.json`。控制台的回调路径是固定的（`/mcp/oauth/callback`），
变的只有来源，所以来源放在路径里。

- 用 `openssl rand -hex 16` 生成 id：16 到 64 个字符，`A-Z a-z 0-9 _ -`，
  至少一个字母和一个数字。
- 之后**一直用同一个**：它是 MCP 服务端注册的 `client_id` 的一部分，
  换一个 id 就是那边的一个新客户端。
- 两个人的面板在同一个地址上（比如都是 `http://localhost:8080`）时，各用各的 id，
  否则会注册出同一个 `client_id`。
- 任何来源地址都能用，回环也不例外；畸形的要求（协议不对、路径不对、id 不合规）
  才会拿到 400。

不想依赖上面这个 Worker，就自己部署一个：

```sh
cd cimd-worker
CLOUDFLARE_API_TOKEN=<有部署 Worker 权限的 token> npx wrangler deploy
```

Worker 没有依赖，也没有构建步骤。

## 二、静态文件：GitHub Pages 上的 mcp-client.json

仓库把这份文档放在 [`mcp-client.json`](https://github.com/4fuu/personal-bot/blob/main/mcp-client.json)，
文档站把它发布在站点根目录，所以它的地址是：

```
https://4fuu.github.io/personal-bot/mcp-client.json
```

内容（`client_id` 就是它自己所在的地址）：

```json
{
  "client_id": "https://4fuu.github.io/personal-bot/mcp-client.json",
  "redirect_uris": ["http://localhost:8080/mcp/oauth/callback"]
}
```

**前提：** 你通过 `http://localhost:8080` 访问面板。如果你用别的地址访问面板——
域名、隧道、其他端口——静态文件就不合适了：`client_id` 必须是被取用时的那个 URL，
所以要么改用上面的 Worker，要么把 `redirect_uris` 改成与浏览器实际使用的地址完全一致
（授权服务器会拒绝不一致的回调地址）。

## 三、什么都不发布

如果不想公开发布任何东西，另外两条路都在面板的 [工作区](./console/workspace) 页面上：

- **动态客户端注册**（`dynamic`）：授权服务器自己支持时才可用。
- **手工注册**（`static`）：在 MCP 服务端上登记一个 client id 和 secret，填进来。

## 在面板里授权

三种办法拿到的都是同一个东西：一个 `client_id`（第一种是 Worker 的 URL，
第二种是 Pages 的 URL，第三种是手工登记的那对）。然后：

1. 在 [工作区](./console/workspace) 页添加或编辑这个 MCP 服务器，
   认证选 OAuth，客户端模式选 元数据文档 / 动态注册 / 手工登记 之一。
2. 点 授权：面板打开授权服务器给的地址，带上它当时算出的跳转地址——
   就是浏览器地址栏里那个来源，不是面板服务端看到的 Host，反代之后两者会不同。
3. 授权服务器把浏览器送回控制台自己的 `/mcp/oauth/callback`，
   控制台把授权码交给模型换令牌，令牌存在模型侧。

换到的令牌存在模型那一边，浏览器一个字节都看不到；刷新令牌也在，
所以授过一次权的服务端下次直接是 已授权。stdio 的服务端走不了这条路——
沙箱里没有浏览器能回来——保存时就会说明。
