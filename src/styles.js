export function buildCss() {
  return `
/* md-beautifier — clean minimal serif theme, light/dark aware */
:root {
  --bg: #fdfdfa;
  --fg: #2b2b2b;
  --muted: #6b6b6b;
  --accent: #7a63b5;
  --accent-soft: rgba(122, 99, 181, 0.12);
  --code-bg: #f4f1ec;
  --code-fg: #3b3b3b;
  --border: #e0dbd2;
  --quote-bg: #dceafc;
  --quote-fg: #3d5a80;
  --tok-comment: #8a877f;
  --tok-keyword: #6d55b0;
  --tok-string: #4a7a5a;
  --tok-number: #a06a35;
  --tok-function: #3f5c7a;
  --tok-variable: #a04040;
  --serif: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, "Times New Roman", serif;
  --mono: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, "Liberation Mono", monospace;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1d1c1a;
    --fg: #e7e2da;
    --muted: #a49f97;
    --accent: #b9a7e0;
    --accent-soft: rgba(185, 167, 224, 0.16);
    --code-bg: #262422;
    --code-fg: #d6d0c8;
    --border: #3a3833;
    --quote-bg: #26334a;
    --quote-fg: #bfd9ff;
    --tok-comment: #8a877f;
    --tok-keyword: #c3b0ec;
    --tok-string: #8fc18f;
    --tok-number: #e0a66a;
    --tok-function: #83a8d9;
    --tok-variable: #d98a8a;
  }
}
*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--serif);
  font-size: 1.0625rem;
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}
.wrap {
  max-width: 46rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 4rem;
}
h1, h2, h3, h4, h5, h6 {
  font-family: var(--serif);
  color: var(--fg);
  line-height: 1.25;
  margin: 1.6em 0 0.55em;
  letter-spacing: -0.01em;
}
h1 { font-size: 2rem; margin-top: 0; padding-bottom: .35em; border-bottom: 1px solid var(--border); }
h2 { font-size: 1.6rem; padding-bottom: .3em; border-bottom: 1px solid var(--border); }
h3 { font-size: 1.3rem; }
h4 { font-size: 1.1rem; }
p { margin: 0 0 1.1em; }
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
ul, ol { padding-left: 1.4em; margin: 0 0 1.2em; }
li { margin: 0.25em 0; }
li > input[type="checkbox"] { margin-right: 0.4em; }
li.task-list-item { list-style: none; margin-left: -1.2em; }
hr { border: none; border-top: 1px solid var(--border); margin: 2.2em 0; }
blockquote {
  margin: 0 0 1.2em;
  padding: 0.1em 1.1em;
  border-left: 3px solid var(--accent);
  background: var(--quote-bg);
  color: var(--quote-fg);
  border-radius: 0 6px 6px 0;
}
blockquote p { margin: 0.6em 0; }
blockquote blockquote { background: transparent; }
img { max-width: 100%; height: auto; border-radius: 6px; }
figure { margin: 1.6em 0; }
figcaption { font-size: 0.9rem; color: var(--muted); text-align: center; margin-top: 0.4em; }
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.4em 0;
  font-size: 0.95em;
}
th, td { padding: 0.55em 0.8em; border: 1px solid var(--border); text-align: left; }
th { background: var(--accent-soft); font-weight: 600; }
tr:nth-child(even) td { background: var(--accent-soft); }
code {
  font-family: var(--mono);
  font-size: 0.87em;
  background: var(--code-bg);
  color: var(--code-fg);
  padding: 0.15em 0.4em;
  border-radius: 4px;
}
pre {
  background: var(--code-bg);
  color: var(--code-fg);
  padding: 1em 1.1em;
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid var(--border);
  line-height: 1.55;
  margin: 0 0 1.2em;
}
pre code { background: transparent; padding: 0; font-size: 0.84rem; }
kbd {
  font-family: var(--mono);
  font-size: 0.82em;
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-bottom-width: 2px;
  border-radius: 4px;
  padding: 0.15em 0.45em;
}
/* highlight.js tokens (self-contained, tuned for the palette) */
.hljs-comment, .hljs-quote { color: var(--tok-comment); font-style: italic; }
.hljs-keyword, .hljs-selector-tag, .hljs-built_in, .hljs-name { color: var(--tok-keyword); font-weight: 600; }
.hljs-string, .hljs-title, .hljs-section, .hljs-attribute, .hljs-template-tag, .hljs-template-variable, .hljs-type, .hljs-addition { color: var(--tok-string); }
.hljs-literal, .hljs-number, .hljs-symbol, .hljs-bullet { color: var(--tok-number); }
.hljs-title.class_, .hljs-title.function_, .hljs-title.function_ .hljs-params { color: var(--tok-function); }
.hljs-deletion, .hljs-variable, .hljs-variable.language_, .hljs-variable.constant_ { color: var(--tok-variable); }
.document-title { margin: 0 0 0.15em; }
.document-subtitle { font-size: 0.92rem; color: var(--muted); margin: 0 0 1.6em; }
`;
}

export function buildHtml({ body, title, subtitle }) {
  const css = buildCss();
  const docTitle = escapeHtml(title || 'Markdown');
  const subtitleHtml = subtitle ? `<p class="document-subtitle">${subtitle}</p>` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${docTitle}</title>
<style>
${css}
</style>
</head>
<body>
<main class="wrap">
${title ? `<h1 class="document-title">${escapeHtml(title)}</h1>` : ''}
${subtitleHtml}
${body}
</main>
</body>
</html>
`;
}

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}