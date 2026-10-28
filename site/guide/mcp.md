# MCP 客户端（OAuth）

模型可以作为 MCP 客户端连接外部工具服务。对于使用 OAuth 2.1 鉴权的 MCP 服务器，若服务端支持 **Client ID Metadata Document**（CIMD），客户端只需将一个公网 HTTPS JSON 文档的 URL 作为 `client_id` 提交给授权服务器；授权服务器会自行拉取该文档，从中读取客户端名称与回调地址 `redirect_uris`。由于 OAuth 规范要求文档内的 `client_id` 必须与拉取它的 URL 完全一致，每个面板访问来源（Origin）都需要一份与之匹配的元数据文档。

以下三种注册方式按推荐顺序排列：前两种使用元数据文档，第三种无需发布任何公网文档。

## 一、使用 Cloudflare Worker 按来源动态生成（推荐）

仓库中的 [`cimd-worker/`](https://github.com/4fuu/personal-bot/tree/main/cimd-worker) 提供了一个零依赖的 Cloudflare Worker，直接从请求路径中读取自定义 ID 和面板访问地址：

```
https://personal-bot-cimd.popoi.work/<id>/http/localhost:8080/mcp-client.json
```

当你的面板运行在 `http://localhost:8080` 时，该地址会返回如下元数据文档：

```json
{
  "client_id": "https://personal-bot-cimd.popoi.work/<id>/http/localhost:8080/mcp-client.json",
  "redirect_uris": ["http://localhost:8080/mcp/oauth/callback"]
}
```

路径格式依次为：自定义 `<id>`、面板协议（`http` 或 `https`）、面板主机名与端口，最后接 `/mcp-client.json`。面板的 OAuth 回调路径固定为 `/mcp/oauth/callback`，变化的只有访问来源，因此一套 Worker 即可服务任意地址的面板。

- 使用 `openssl rand -hex 16` 生成一个 `<id>`（长度 16–64 位，仅限 `A-Z a-z 0-9 _ -`，且至少包含一个字母和一个数字）。
- 生成后请**固定使用同一个 ID**：它是注册到 MCP 服务端的 `client_id` 的一部分，更换 ID 会被服务端视为全新的客户端。
- 即使多位用户都通过 `http://localhost:8080` 访问各自本地的面板，只要各自使用不同的 `<id>`，就不会在同一个 MCP 服务端上发生 `client_id` 冲突。
- 支持任意公网域名或本地回环地址；只有格式不合法的请求（协议错误、路径不符或 ID 不满足规则）才会返回 `400`。

如果不希望依赖公共 Worker，也可以直接部署到你自己的 Cloudflare 账号下（无第三方依赖、无需构建步骤）：

```sh
cd cimd-worker
CLOUDFLARE_API_TOKEN=<具有部署 Worker 权限的令牌> npx wrangler deploy
```

## 二、使用 GitHub Pages 上的静态 `mcp-client.json`

仓库根目录提供了静态文件 [`mcp-client.json`](https://github.com/4fuu/personal-bot/blob/main/mcp-client.json)，并由文档站自动发布在根路径：

```
https://4fuu.github.io/personal-bot/mcp-client.json
```

其内容固定为：

```json
{
  "client_id": "https://4fuu.github.io/personal-bot/mcp-client.json",
  "redirect_uris": ["http://localhost:8080/mcp/oauth/callback"]
}
```

**适用前提：** 你在浏览器中通过 `http://localhost:8080` 访问管理面板。如果你通过自定义域名、内网穿透隧道或其他端口访问面板，浏览器的实际回调地址将不再是 `http://localhost:8080/mcp/oauth/callback`，授权服务器会因回调地址不匹配而拒绝授权。此时请改用上面的 Worker，或 Fork 仓库后修改 `mcp-client.json` 中的 `client_id` 与 `redirect_uris` 并通过你自己的 GitHub Pages 发布。

## 三、不使用元数据文档

如果不想发布任何公网文档，可以在面板的[工作区](./console/workspace)页面选择另外两种客户端注册方式：

- **动态注册**：由模型服务向授权服务器自动发起动态客户端注册（需授权服务器支持 RFC 7591）。
- **预先注册的 client id**：先在目标 MCP 服务端手动创建 OAuth 客户端，再把拿到的 Client ID 和 Client Secret 填入面板。

## 在管理面板中完成授权

1. 进入面板的[工作区](./console/workspace)页面，在 **MCP 服务器** 卡片中点击 **添加服务器**（或编辑已有服务器），将 **认证** 设为 **OAuth 2.1**，并在 **客户端注册** 中选择 **客户端元数据文档（CIMD）**、**动态注册** 或 **预先注册的 client id**。
2. 保存后点击该服务器行上的 **授权**：面板会按当前浏览器地址栏的实际访问来源计算出回调地址，并在新标签页打开授权服务器的登录授权页（即使面板部署在反向代理后也能保持地址一致）。
3. 授权通过后，浏览器跳回面板的 `/mcp/oauth/callback`，由面板将授权码转交模型服务换取访问令牌与刷新令牌。

OAuth 令牌保存在模型服务侧的数据库中，绝不会返回给浏览器；只要持有有效的访问令牌或刷新令牌，该服务器就会保持 **已授权** 状态，后续连接会自动续期。采用 `stdio` 传输的服务器在沙箱内运行，不支持浏览器 OAuth 回调，保存时界面会直接提示原因。
