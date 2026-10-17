import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { renderMarkdown } from './renderer.js';
import { escapeHtml } from './styles.js';
import { saveFile, ttlMs } from './storage.js';

export const SERVER_NAME = 'md-beautifier';
export const SERVER_VERSION = '1.0.0';

const ttlHoursLabel = () => {
  const hours = Number(process.env.FILE_TTL_HOURS ?? '1');
  return (Number.isFinite(hours) && hours > 0 ? hours : 1).toString();
};

export function createMcpServer() {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  server.registerTool(
    'render_markdown_to_html',
    {
      title: 'Render Markdown to Pretty HTML',
      description:
        'Takes raw Markdown text, renders it as a complete self-contained HTML document ' +
        '(clean typographic styling: serif fonts, syntax highlighting, light/dark aware) ' +
        'and saves it on the server. Returns a URL (…/files/<id>.html) where the document ' +
        `is served. The file is deleted automatically after ${ttlHoursLabel()} hour(s), so ` +
        'open or save the link (e.g. print to PDF) promptly if it must be kept. ' +
        'Use the returned URL exactly as-is; never invent or modify it.',
      inputSchema: {
        markdown: z.string().min(1).describe('The raw Markdown content to render.'),
        title: z.string().optional().describe('Optional document title, shown as a page heading and in <title>.'),
        subtitle: z.string().optional().describe('Optional small muted line rendered under the title.'),
      },
    },
    async (args) => {
      try {
        const html = renderMarkdown(args.markdown, {
          title: args.title,
          subtitle: args.subtitle,
        });
        const base = process.env.MCP_PUBLIC_BASE_URL;
        if (base) {
          const id = saveFile(html);
          return {
            content: [
              {
                type: 'text',
                text: `${base}/files/${id}.html\n` +
                  `Rendered document saved; it will be deleted automatically after ${ttlHoursLabel()} hour(s).`,
              },
            ],
          };
        }
        // No public base URL configured: fall back to returning the raw HTML.
        return { content: [{ type: 'text', text: html }] };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Rendering failed: ${escapeHtml(err?.message ?? String(err))}` }],
        };
      }
    }
  );

  return server;
}
