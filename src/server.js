import { createServer } from 'http';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './mcp.js';
import { dataDir, ensureDataDir, sweepExpired, ttlMs } from './storage.js';

const transport = process.env.MCP_TRANSPORT || 'http';

if (transport === 'stdio') {
  const server = createMcpServer();
  const stdio = new StdioServerTransport();
  server.connect(stdio);
  process.stderr.write('[md-beautifier] running as stdio MCP server\n');
} else {
  const host = process.env.HOST || '0.0.0.0';
  const port = Number(process.env.PORT) || 3010;
  const apiToken = process.env.MCP_API_TOKEN || '';

  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Persisted rendered documents (written by the MCP tool), served at /files/<uuid>.html.
  // No app-level auth: the fronting reverse proxy (nginx IP allowlist) is the protection.
  ensureDataDir();
  const UUID_HTML = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.html$/;
  app.get('/files/:file', (req, res) => {
    const name = req.params.file;
    if (!UUID_HTML.test(name)) res.status(404).end();
    else res.sendFile(path.join(dataDir(), name), (err) => err && res.status(404).end());
  });

  app.get('/health', (_req, res) => {
    res.json({ ok: true, name: 'md-beautifier' });
  });

  app.post('/mcp', async (req, res, next) => {
    if (apiToken) {
      const provided = String(req.headers.authorization || '');
      if (provided !== `Bearer ${apiToken}`) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
    }
    try {
      const server = createMcpServer();
      const mcpTransport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      res.on('close', () => {
        server.close();
      });
      await server.connect(mcpTransport);
      await mcpTransport.handleRequest(req, res, req.body);
    } catch (err) {
      next(err);
    }
  });

  app.get('/mcp', (req, res) => {
    const server = createMcpServer();
    const mcpTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    server.connect(mcpTransport);
    mcpTransport.handleRequest(req, res, req.body).catch(() => {});
  });

  app.delete('/mcp', (req, res) => {
    res.status(405).end();
  });

  // TTL sweep: purge documents whose mtime is older than FILE_TTL_HOURS.
  const sweep = () => {
    try {
      const removed = sweepExpired();
      if (removed.length) process.stderr.write(`[md-beautifier] expired ${removed.length} file(s) in ${dataDir()}\n`);
    } catch (err) {
      process.stderr.write(`[md-beautifier] TTL sweep failed: ${err?.message ?? err}\n`);
    }
  };
  sweep();
  setInterval(sweep, Math.min(15 * 60_000, ttlMs())).unref();

  const httpServer = createServer(app);
  httpServer.listen(port, host, () => {
    process.stderr.write(`[md-beautifier] Streamable HTTP MCP server on http://${host}:${port}/mcp (files in ${dataDir()}, TTL ${ttlMs() / 3_600_000}h)\n`);
  });
}