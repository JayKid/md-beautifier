# md-beautifier

An MCP server that turns raw Markdown into a complete, self-contained HTML document
rendered with clean typographic styling — serif fonts, syntax highlighting, and
automatic light/dark mode. Your LLM agent can hand it the raw markdown it wrote and
get back a ready-to-embed `<html>` string (all CSS inlined, works offline, no CDN).

Packaged as a single Node.js container, run with Docker Compose.

## The tool

| | |
|---|---|
| **Name** | `render_markdown_to_html` |
| **Transport** | MCP **Streamable HTTP** at `http://<host>:3010/mcp` (stdio mode also supported) |
| **Input** | `markdown` (required), `title`, `subtitle` (optional) |
| **Output** | Full HTML document as a text string |

Example of how an agent calls it:

```
render_markdown_to_html(markdown="<raw md>", title="Holiday Guide")
```

## Quick start

```bash
docker compose up -d --build
```

Verify it is healthy and reachable:

```bash
curl http://localhost:3010/health
```

Test a render directly:

```bash
curl -s -X POST http://localhost:3010/mcp \
  -H "Content-Type: application/json" -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"curl","version":"0"}}}'
```

## Connecting Open WebUI (>= 0.6.31)

Open WebUI only supports **Streamable HTTP** MCP servers natively, so this is the
default transport.

1. **Admin Settings → External Tools → + Add Server**
2. **Type:** `MCP (Streamable HTTP)`
3. **Server URL:** `http://host.docker.internal:3010/mcp`
   - `host.docker.internal` works when Open WebUI itself runs in Docker on the same host.
   - Use `http://localhost:3010/mcp` if Open WebUI runs natively on the host.
   - From another machine, use the host's LAN IP.
4. **Auth:** `None` by default. If you set `MCP_API_TOKEN` in `.env`, choose
   `Bearer` and enter the token.
5. Save, then enable the tool for a model and make sure **function calling** is on
   for that model so the agent can invoke it.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3010` | HTTP port the MCP endpoint listens on |
| `HOST` | `0.0.0.0` | Bind address |
| `MCP_TRANSPORT` | `http` | `http` (Streamable HTTP) or `stdio` |
| `MCP_API_TOKEN` | *(empty)* | If set, requests must carry `Authorization: Bearer <token>` |

### stdio mode (for other clients)

Some clients (e.g. Claude Desktop, opencode) can launch stdio MCP servers directly:

```bash
docker compose run --rm -e MCP_TRANSPORT=stdio md-beautifier
```

or run natively:

```bash
npm install && MCP_TRANSPORT=stdio node src/server.js
```

## Styling

The embedded stylesheet lives in `src/styles.js` — a single place to tweak fonts,
colors, and layout. Current look:

- Clean minimal article layout, ~46rem reading width
- Serif type stack: `Iowan Old Style / Palatino Linotype / Palatino / Georgia`
- Syntax highlighting via highlight.js (common languages), palette tuned to the theme
- Automatic light/dark via `prefers-color-scheme`
- Styled tables, blockquotes, task lists, `kbd`, images

Raw HTML in markdown is escaped (not executed), so the tool is safe to run on
untrusted input.

## Development

```bash
npm install
npm test        # unit tests for the renderer
npm start       # run locally on :3010
```

## Layout

```
├── docker-compose.yml    # runs the service, maps :3010
├── Dockerfile            # node:22-alpine
├── src/
│   ├── server.js         # entry: HTTP/stdio transport + wiring
│   ├── mcp.js            # MCP server + tool definition
│   ├── renderer.js       # markdown-it + highlight.js
│   └── styles.js         # embedded CSS template
└── test/renderer.test.js
```
