// Guards against JSX expression injection through raw HTML blocks in the markdown
// rendering pipeline. Runs the real unified/remark/rehype pipeline against the real
// rehypeWrapSymbols source, since the UI jest config mocks that whole stack and so
// cannot exercise this path.
//
// Run: node --import tsx --test tests/security/*.test.mts
import test from 'node:test'
import assert from 'node:assert/strict'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkGfm from 'remark-gfm'
import rehypeStringify from 'rehype-stringify'
import { rehypeWrapSymbols } from '../../redisinsight/ui/src/utils/formatters/markdown/rehypeWrapSymbols.ts'

// Mirrors MarkdownToJsxString.ts, minus the DOM-dependent sanitize/link/image
// plugins that are irrelevant to brace neutralization.
const render = (markdown: string): Promise<string> =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeWrapSymbols)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown)
    .then((file) => String(file))

// A live JSX expression is `{` NOT immediately followed by the `"` of the
// {"..."} wrapper. If any survives, JsxParser would evaluate it.
const hasLiveJsxExpression = (html: string): boolean => /\{(?!")/.test(html)

const INJECTION_PAYLOADS = [
  '<p>{alert(1)}</p>',
  '<p>{({}).constructor.constructor("return document.title=\'PWNED\'")()}</p>',
  '<div>{window.windowId}</div>',
  '<span>{({}).constructor.constructor("window.open(\'file:///C:/Windows/System32/calc.exe\')")()}</span>',
]

test('neutralizes JSX expressions inside raw HTML blocks', async () => {
  for (const payload of INJECTION_PAYLOADS) {
    const html = await render(payload)
    assert.equal(
      hasLiveJsxExpression(html),
      false,
      `payload left a live expression: ${payload}\n-> ${html}`,
    )
  }
})

test('escapes JSX expressions in plain markdown text', async () => {
  const html = await render('{alert(1)}')
  assert.equal(hasLiveJsxExpression(html), false)
})

test('preserves legitimate raw HTML tags and attributes', async () => {
  const html = await render('<p class="note">Hello <b>world</b></p>')
  assert.match(html, /<p class="note">/)
  assert.match(html, /<b>world<\/b>/)
})

test('preserves standard markdown formatting', async () => {
  const html = await render('**bold** and [link](https://redis.io)')
  assert.match(html, /<strong>bold<\/strong>/)
  assert.match(html, /<a href="https:\/\/redis\.io">link<\/a>/)
})
