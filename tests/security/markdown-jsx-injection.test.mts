// Guards against JSX expression injection through raw HTML in the markdown
// rendering pipeline. remarkSanitize neutralizes JSX braces in user HTML via
// wrapJsxBraces before the formatter emits its own components; that helper and
// the component output are exercised here with the real sources, since the UI
// jest config mocks the unified/remark/rehype stack.
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
import { rehypeWrapSymbols } from '../../redisinsight/ui/src/utils/formatters/markdown/rehypeWrapSymbols.ts'
import { wrapJsxBraces } from '../../redisinsight/ui/src/utils/formatters/markdown/wrapJsxBraces.ts'

// A live JSX expression is `{` NOT immediately followed by the `"` of the
// {"..."} wrapper. If any survives, JsxParser would evaluate it.
const hasLiveJsxExpression = (html: string): boolean => /\{(?!")/.test(html)

const INJECTION_PAYLOADS = [
  '<p>{alert(1)}</p>',
  '<p>{({}).constructor.constructor("return document.title=\'PWNED\'")()}</p>',
  '<div>{window.windowId}</div>',
  '<span>{({}).constructor.constructor("window.open(\'file:///C:/Windows/System32/calc.exe\')")()}</span>',
]

test('neutralizes JSX expressions in raw HTML', () => {
  for (const payload of INJECTION_PAYLOADS) {
    const escaped = wrapJsxBraces(payload)
    assert.equal(
      hasLiveJsxExpression(escaped),
      false,
      `payload left a live expression: ${payload}\n-> ${escaped}`,
    )
  }
})

test('leaves tag syntax and commas intact', () => {
  const html = wrapJsxBraces('<div style="font-family: Arial, sans-serif">hi</div>')
  assert.equal(html, '<div style="font-family: Arial, sans-serif">hi</div>')
})

// The formatter emits its own JSX for code blocks after sanitizing; that output
// must keep its evaluable props.
const renderCode = (markdown: string): Promise<string> =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCode, { allLangs: true })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeWrapSymbols)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown)
    .then((file) => String(file))

test('preserves JSX props on formatter-generated code components', async () => {
  const html = await renderCode(['```redis', 'GET user:1', '```'].join('\n'))
  // remarkCode emits `path={path}` and the code value as a `{...}` expression
  // for JsxParser to evaluate; neutralizing raw HTML must not corrupt these.
  assert.match(html, /path=\{path\}/)
  assert.match(html, /\{"GET user:1"\}/)
})

test('escapes JSX expressions in plain markdown text via rehypeWrapSymbols', async () => {
  const html = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeWrapSymbols)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process('{alert(1)}')
    .then((file) => String(file))
  assert.equal(hasLiveJsxExpression(html), false)
})
