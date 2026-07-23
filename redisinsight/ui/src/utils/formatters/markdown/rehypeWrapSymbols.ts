import { visit } from 'unist-util-visit'

// JsxParser evaluates any `{expression}` it finds in the serialized HTML, so
// curly braces are wrapped as {"$&"} string expressions to render literally.
//
// `text` nodes hold plain content, so the full symbol set is escaped (including
// `>`, which JSX also treats as syntax). `raw` nodes hold serialized HTML from
// raw HTML blocks: their tags legitimately contain `>`, so escaping that would
// corrupt the markup, but a `{expression}` inside a tag (e.g. `<p>{code}</p>`)
// still reaches JsxParser, so the curly braces are neutralized there too.
const JSX_BRACES = ['{', '}']

const wrapSymbols = (value: string, symbols: string[]): string =>
  value.replace(new RegExp(`[${symbols.join()}]`, 'g'), '{"$&"}')

export const rehypeWrapSymbols =
  (symbols: string[] = ['{', '}', '>']): ((tree: Node) => void) =>
  (tree: any) => {
    visit(tree, (node: any) => {
      if (!node.value) {
        return
      }
      if (node.type === 'text') {
        node.value = wrapSymbols(node.value, symbols)
      } else if (node.type === 'raw') {
        node.value = wrapSymbols(node.value, JSX_BRACES)
      }
    })
  }
