import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from '../src/renderer.js';
import { buildHtml, escapeHtml } from '../src/styles.js';

test('renders headings and paragraphs', () => {
  const html = renderMarkdown('# Hello\n\nSome *emphasis* and **bold**.');
  assert.match(html, /<h1>Hello<\/h1>/);
  assert.match(html, /<em>emphasis<\/em>/);
  assert.match(html, /<strong>bold<\/strong>/);
  assert.match(html, /<!DOCTYPE html>/);
});

test('includes document title and subtitle', () => {
  const html = renderMarkdown('body text', { title: 'Holiday Guide', subtitle: 'July 2026' });
  assert.match(html, /<h1 class="document-title">Holiday Guide<\/h1>/);
  assert.match(html, /<p class="document-subtitle">July 2026<\/p>/);
  assert.match(html, /<title>Holiday Guide<\/title>/);
});

test('syntax-highlights code blocks with language', () => {
  const html = renderMarkdown('```js\nconst x = 1;\n```');
  assert.match(html, /language-js/);
  assert.match(html, /hljs-keyword/);
});

test('escapes plain code blocks without a language', () => {
  const html = renderMarkdown('```\n<tag> & stuff\n```');
  assert.match(html, /&lt;tag&gt; &amp; stuff/);
  assert.doesNotMatch(html, /<tag>/);
});

test('raw html is escaped, not executed', () => {
  const html = renderMarkdown('<script>alert(1)</script>\n\nsafe');
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('renders task lists', () => {
  const html = renderMarkdown('- [ ] todo\n- [x] done');
  assert.match(html, /task-list-item/);
  assert.match(html, /<input type="checkbox" disabled> /);
  assert.match(html, /<input type="checkbox" checked disabled>/);
});

test('buildHtml escapes title injection', () => {
  const html = buildHtml({ body: '<p>hi</p>', title: '<script>alert(1)</script>' });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /<title>&lt;script&gt;alert\(1\)&lt;\/script&gt;<\/title>/);
});

test('escapeHtml handles special chars', () => {
  assert.equal(escapeHtml('<a href="x">&'), '&lt;a href=&quot;x&quot;&gt;&amp;');
});
