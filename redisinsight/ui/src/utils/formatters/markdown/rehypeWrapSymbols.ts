import { visit } from 'unist-util-visit'

// Components the formatter emits as raw HTML after sanitization. They carry
// intentional {expr} props for JsxParser to evaluate and use PascalCase tag
// names that user HTML cannot produce (the HTML parser lowercases tags), so they
// are matched case-sensitively and left untouched.
const FORMATTER_COMPONENT_TAG =
  /^<(?:Code|Link|CloudLink|RedisInsightLink|RedisUploadButton)[\s/>]/

// Wraps `{`/`}` in the text between tags as {"$&"} string expressions. Braces
// inside a tag are attribute syntax (DOMPurify has already quoted them, so
// JsxParser reads them as literal text) and must stay intact for the tag to
// parse, so only text content is wrapped.
const wrapRawBraces = (value: string): string =>
  value.replace(/<[^>]*>|[{}]/g, (match) =>
    match.length === 1 ? `{"${match}"}` : match,
  )

// Wraps characters that JSX treats as syntax so the serialized HTML survives
// JsxParser and renders literally. Text nodes are plain content. Raw HTML nodes
// come from raw HTML blocks in markdown and would otherwise deliver a live
// `{expression}` straight to JsxParser.
export const rehypeWrapSymbols =
  (symbols: string[] = ['{', '}', '>']): ((tree: Node) => void) =>
  (tree: any) => {
    visit(tree, 'text', (node) => {
      const { value } = node
      if (value) {
        node.value = value.replace(
          new RegExp(`[${symbols.join()}]`, 'g'),
          '{"$&"}',
        )
      }
    })
    visit(tree, 'raw', (node: any) => {
      if (node.value && !FORMATTER_COMPONENT_TAG.test(node.value)) {
        node.value = wrapRawBraces(node.value)
      }
    })
  }
