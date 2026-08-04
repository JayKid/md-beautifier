import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import { buildHtml, escapeHtml } from './styles.js';

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs language-${escapeHtml(lang)}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
      } catch {
        // fall through to escaped plain text
      }
    }
    return `<pre><code class="hljs">${escapeHtml(str)}</code></pre>`;
  },
});

md.use(pluginTaskLists);

function pluginTaskLists(mdInstance) {
  const defaultRender = mdInstance.renderer.rules.list_item_open ||
    function (tokens, idx, options, _env, self) {
      return self.renderToken(tokens, idx, options);
    };

  mdInstance.renderer.rules.list_item_open = function (tokens, idx, options, env, self) {
    for (let j = idx + 1; j < tokens.length; j++) {
      if (tokens[j].type === 'list_item_close') break;
      if (tokens[j].type !== 'inline') continue;
      const content = tokens[j].content;
      let checked = false;
      let matches = null;
      if (content.startsWith('[ ] ')) {
        matches = /^\[ \] /.exec(content);
      } else if (content.startsWith('[x] ') || content.startsWith('[X] ')) {
        matches = /^\[[xX]\] /.exec(content);
        checked = true;
      }
      if (matches) {
        tokens[j].content = tokens[j].content.slice(matches[0].length);
        return `${defaultRender(tokens, idx, options, env, self)} class="task-list-item" data-checked="${checked ? 'true' : 'false'}">` +
          `<input type="checkbox"${checked ? ' checked' : ''} disabled> `;
      }
      break;
    }
    return defaultRender(tokens, idx, options, env, self);
  };
}

export function renderMarkdown(markdown, options = {}) {
  const body = md.render(String(markdown ?? ''));
  return buildHtml({ body, title: options.title, subtitle: options.subtitle });
}