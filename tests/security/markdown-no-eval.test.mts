// Renders markdown through the real react-markdown + safeUrl pipeline (no
// jest mocks) and asserts that raw HTML, JS-eval payloads, and dangerous URL
// schemes never make it into the rendered output as live markup or links.
import test from 'node:test'
import assert from 'node:assert/strict'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { safeUrl } from '../../redisinsight/ui/src/utils/formatters/markdown/safeUrl.ts'

const render = (md: string): string =>
  renderToStaticMarkup(
    React.createElement(
      ReactMarkdown,
      { remarkPlugins: [remarkGfm], urlTransform: safeUrl },
      md,
    ),
  )

test('raw HTML with a JSX expression renders as escaped text, not DOM', () => {
  const html = render('<p>{({}).constructor.constructor("return 1")()}</p>')
  // renderToStaticMarkup escapes "<" and ">" as &lt; and &gt; (not numeric entities)
  assert.match(html, /&lt;p&gt;/)
})

test('raw <script> HTML renders as escaped text, never a live script tag', () => {
  const html = render('<script>alert(1)</script>')
  assert.equal(html.includes('<script'), false)
  assert.match(html, /&lt;script&gt;/)
})

test('javascript: and data: links are dropped', () => {
  const html = render(
    '[x](javascript:alert(1)) and [y](data:text/html,<script>1</script>)',
  )
  assert.equal(/href="javascript:/.test(html), false)
  assert.equal(/href="data:/.test(html), false)
  // safeUrl neutralizes the href to "" rather than dropping the anchor entirely
  assert.match(html, /<a href="">x<\/a>/)
})

test('img onerror payload does not become an element', () => {
  const html = render('<img src=x onerror=alert(1)>')
  // no real <img> tag is emitted; the whole payload is escaped text, so
  // "onerror" never lands inside a live HTML attribute
  assert.equal(html.includes('<img'), false)
  assert.match(html, /&lt;img/)
})

test('markdown image with a javascript: scheme has its src neutralized', () => {
  const html = render('![x](javascript:alert(1))')
  // this goes through the real markdown ![]() code path, not raw HTML;
  // safeUrl strips the dangerous scheme so the live <img> keeps an empty src
  assert.equal(html.includes('src="javascript:'), false)
  assert.match(html, /<img src="" alt="x"\/>/)
})
