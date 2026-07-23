// Guards against JSX expression injection through raw HTML in the markdown
// rendering pipeline. rehypeWrapSymbols runs only in the JsxParser path
// (MarkdownToJsxString); it wraps braces in raw HTML text content while leaving
// attributes and the formatter's own components intact. Runs the real
// unified/remark/rehype pipeline against the real sources, since the UI jest
// config mocks that whole stack.
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

// Mirrors MarkdownToJsxString.ts plugin order, minus the DOM-dependent
// sanitize/link/image plugins that are irrelevant to brace neutralization.
const render = (markdown: string): Promise<string> =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCode, { allLangs: true })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeWrapSymbols)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown)
    .then((file) => String(file))

test('neutralizes JSX expressions in raw HTML text content', async () => {
  // A unique marker whose opening brace must be wrapped, so the raw `{__PWN__`
  // never survives to JsxParser regardless of its position in the text.
  const payloads = [
    '<p>{__PWN__}</p>',
    '<div>prefix {__PWN__} suffix</div>',
    '<span>{({}).constructor.constructor("__PWN__")()}</span>',
  ]
  for (const payload of payloads) {
    const html = await render(payload)
    assert.equal(
      html.includes('{__PWN__'),
      false,
      `unescaped expression survived: ${payload}\n-> ${html}`,
    )
  }
})

test('escapes JSX expressions in plain markdown text', async () => {
  const html = await render('{__PWN__}')
  assert.equal(html.includes('{__PWN__'), false)
})

test('leaves braces inside raw HTML attributes intact', async () => {
  const html = await render('<a href="https://redis.io/{id}">link</a>')
  assert.match(html, /href="https:\/\/redis\.io\/\{id\}"/)
})

test('preserves JSX props on formatter-generated code components', async () => {
  const html = await render(['```redis', 'GET user:1', '```'].join('\n'))
  // remarkCode emits `path={path}` and the code value as a `{...}` expression
  // for JsxParser to evaluate; neutralizing raw HTML must not corrupt these.
  assert.match(html, /path=\{path\}/)
  assert.match(html, /\{"GET user:1"\}/)
})

test('escapes a lowercase look-alike of a formatter component', async () => {
  const html = await render('<code>{__PWN__}</code>')
  assert.equal(html.includes('{__PWN__'), false)
})
