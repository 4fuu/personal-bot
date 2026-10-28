# Workspace

The **工作区** page contains three cards: **环境变量** (environment variables),
**Skills**, and **MCP 服务器** (MCP servers). The first two configure the
environment and skills available inside the command sandbox, while the third
connects external MCP tools.

## 环境变量 (Environment variables)

Every command executed in the sandbox runs with the variables configured here.
Each variable has a name and a kind—either **保密** (secret, the default) or
**明文** (plain):

- **Write-only secrets and automatic scrubbing:** Secret values are stored on
  the bot side and never returned to the browser or shown in logs. Any
  occurrence of a secret value (including Base64 and URL-encoded forms) in
  command output, search results, or tool responses is replaced with
  `[已隐藏:NAME]` before reaching the model or the event log, and any outbound
  chat bubble containing one is blocked in code before Jev review.
- **Naming and length rules:** Variable names must be valid shell identifiers
  (`[A-Za-z_][A-Za-z0-9_]*`, up to 64 characters). Secret values must be at
  least 8 characters long so the scrubber never matches ordinary short text.
- **Reserved variables:** Sandbox-owned variables (`PATH`, `HOME`,
  `HTTP_PROXY`, `HTTPS_PROXY`, `LD_PRELOAD`, `NODE_OPTIONS`, and related system
  variables) cannot be overridden; the form names the rule if you enter one.

Changes apply immediately to the next command executed in the sandbox without
restarting or rebuilding any container.

## Skills

Skills live in `/workspace/skills`, where **the assistant can read, edit, and
install them itself**. This card manages *skill sources*—Git repositories that
the bot installs and updates on a schedule inside the sandbox:

- **Supported addresses:** A GitHub shorthand (`owner/repo`) or an `http(s)://`
  Git repository URL. SSH URLs, local filesystem paths, and URLs pointing at a
  single file or archive are rejected with an explanation (the sandbox can only
  reach the internet over the HTTP(S) proxy and cannot see paths outside
  `/workspace`).
- **Update interval:** Choose 1, 3, 7 (default), 14, 30, or 90 days (1–365 days
  supported by the API). Adding a source automatically adds its Git host and
  `registry.npmjs.org` to the sandbox egress allowlist and starts the initial
  install right away.
- **Status and actions:** Each row shows the source address, installed Git
  commit, last update time, and status (any failure reason is shown inline and
  also surfaces in **待处理** on [Overview](./)). **立即更新** triggers an
  immediate update; **删除** removes the source entry while leaving the files it
  already installed in `/workspace/skills`.

## MCP 服务器 (MCP servers)

The assistant discovers and calls MCP server functions through its script
runner. Each server occupies one summary line in the system prompt, frozen for
the life of the context window: adding or removing a server takes effect at the
next window rollover, whereas **toggling a server or individual function on or
off takes effect immediately**—calls to a disabled server or function are
rejected in host code with a clear explanation without mutating the cached
prompt prefix.

- **Server rows:** Each row shows the server's name, description, status pill
  (**已连接** / **需要授权** / **出错** / **未检查** / **已停用**), discovered
  function count (and how many are disabled), transport, and authorization
  state, along with **授权** (for OAuth 2.1), **编辑**, **停用** / **启用**, and
  **删除** buttons.
- **Per-function switches:** Expanding a server row lists every function cached
  from its last successful discovery—showing the function name, description,
  parameter types, and required flags—with an individual enable/disable switch
  for each function.
- **Transports:** `Streamable HTTP`, `HTTP+SSE（旧）`, and `stdio（在沙箱里跑）`
  (`stdio` servers run inside the sandbox and reach the network only through
  the egress proxy).
- **Authentication modes:** **不用认证** (none), **静态请求头** (static headers
  whose values are the *names* of stored [environment variables](#环境变量-environment-variables),
  resolved from the secret store at connect time and never stored in `bot.db`),
  and **OAuth 2.1**.
- **Field validation:** Server names are lowercase identifiers
  (`[a-z][a-z0-9_]{0,31}`), and technical fields (URLs, commands, arguments,
  client IDs) accept printable ASCII only, validated inline before saving.

For OAuth 2.1 client registration options and the authorization flow, see
[MCP client (OAuth)](../mcp).
