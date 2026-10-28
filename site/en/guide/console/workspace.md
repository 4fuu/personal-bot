# Workspace

Three cards: environment variables, Skills, MCP servers. The first two are what
the sandbox's commands can touch; the third is the external functions the
assistant can call.

## 环境变量: environment variables

Every command in the sandbox runs with these variables. A variable has a name and
one of two kinds, 明文 (plain) or 保密 (secret); a secret is write-only, and any
secret value is scrubbed from every result that reaches the model or the log as
`[已隐藏:名字]` - a message carrying one is refused in code, before Jev.

- The name must be a shell variable name (a letter first, at most 64 characters).
- The sandbox's own fixed entries cannot be overridden: `PATH`, `HOME`, the proxy
  settings, `LD_PRELOAD` and the rest are the host's to set, not the model's, and
  the page names the rule.
- A secret value must be at least 8 characters, so the scrubber cannot match
  ordinary text.

A change applies to the next command; nothing is rebuilt.

## Skills

Skills install into `/workspace/skills`, and **the model can read, edit and add
them itself**. This card manages the *sources*: an address the installer keeps
current on an interval.

- An address is a GitHub shorthand (`owner/repo`) or an `https://` git address.
  An SSH address, a local path or a URL that points at a file rather than a
  repository is refused with the reason - the proxy tunnels only 443, and nothing
  outside the workspace is visible to the sandbox.
- The interval is 1 to 365 days, 7 by default.
- Each row shows the commit it was installed at, when it last updated, and
  正常 / 失败; a failure carries the reason and also appears in 概览's 待处理.
  立即更新 runs the install now; 移除 drops the source while the skills it
  installed stay in the workspace.

## MCP 服务器: MCP servers

The model reaches a server only through `code_exec`, as
`tools["server.function"](args)`; a function's name is looked up with
`tool_search` first. The system prompt carries one line per server, frozen with
the window, so disabling a server or a function does not change that line - the
call is refused with the rule instead.

- 添加 / 编辑 / 停用 / 删除, one row per server: status (connected / needs_auth /
  error), the function count, how many are switched off, the transport and the
  authorization state.
- A row expands in place into the functions that server offers: name, description,
  parameters and a switch each.
- Three transports: Streamable HTTP, SSE and stdio (a stdio one runs in the
  sandbox and reaches the network only through the proxy).
- Three auth modes: none, headers (a header's value is the *name* of an
  [environment variable](#环境变量-environment-variables), read at connect time,
  never stored or returned) and OAuth.
- A server name is a lowercase identifier so a script never has to quote it;
  technical values (addresses, commands, client ids) are English letters, digits
  and punctuation only, the form states the rule under the field and holds the
  save until it is met.

The OAuth flow has its own page: [MCP client](../mcp).
