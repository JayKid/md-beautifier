import { createServer } from 'http';
import express from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer } from './mcp.js';

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

  const httpServer = createServer(app);
  httpServer.listen(port, host, () => {
    process.stderr.write(`[md-beautifier] Streamable HTTP MCP server on http://${host}:${port}/mcp\n`);
  });
}