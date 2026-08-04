import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { renderMarkdown } from './renderer.js';
import { escapeHtml } from './styles.js';

export const SERVER_NAME = 'md-beautifier';
export const SERVER_VERSION = '1.0.0';

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
        'Takes raw Markdown text and returns a complete, self-contained HTML document ' +
        'rendered with clean typographic styling (serif fonts, syntax highlighting, ' +
        'light/dark aware). The returned HTML embeds all CSS, so it can be displayed ' +
        'directly or saved as a .html file.',
      inputSchema: {
        markdown: z
          .string()
          .min(1)
          .describe('The raw Markdown content to render.'),
        title: z
          .string()
          .optional()
          .describe('Optional document title, shown as a page heading and in <title>.'),
        subtitle: z
          .string()
          .optional()
          .describe('Optional small muted line rendered under the title.'),
      },
    },
    async (args) => {
      try {
        const html = renderMarkdown(args.markdown, {
          title: args.title,
          subtitle: args.subtitle,
        });
        return {
          content: [{ type: 'text', text: html }],
        };
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