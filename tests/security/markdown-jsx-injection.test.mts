// Guards against JSX expression injection through raw HTML in the markdown
// rendering pipeline. Runs the real unified/remark/rehype pipeline against the
// real formatter plugins, since the UI jest config mocks that whole stack and so
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
import { remarkCode } from '../../redisinsight/ui/src/utils/formatters/markdown/remarkCode.ts'
import { remarkWrapHtmlSymbols } from '../../redisinsight/ui/src/utils/formatters/markdown/remarkWrapHtmlSymbols.ts'
import { rehypeWrapSymbols } from '../../redisinsight/ui/src/utils/formatters/markdown/rehypeWrapSymbols.ts'

// Mirrors MarkdownToJsxString.ts plugin order, minus the DOM-dependent
// sanitize/link/image plugins that are irrelevant to brace neutralization.
const render = (markdown: string): Promise<string> =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkWrapHtmlSymbols)
    .use(remarkCode, { allLangs: true })
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

test('preserves JSX props on formatter-generated code components', async () => {
  const html = await render(['```redis', 'GET user:1', '```'].join('\n'))
  // remarkCode emits `path={path}` and the code value as a `{...}` expression
  // for JsxParser to evaluate; neutralizing raw HTML must not corrupt these.
  assert.match(html, /path=\{path\}/)
  assert.match(html, /\{"GET user:1"\}/)
})

test('preserves legitimate raw HTML tags and attributes', async () => {
  const html = await render('<div style="font-family: Arial, sans-serif">hi</div>')
  assert.match(html, /<div style="font-family: Arial, sans-serif">/)
  assert.equal(html.includes('{","}'), false)
})

test('preserves standard markdown formatting', async () => {
  const html = await render('**bold** and `code`')
  assert.match(html, /<strong>bold<\/strong>/)
})
