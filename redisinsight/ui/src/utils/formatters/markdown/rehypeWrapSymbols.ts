import { visit } from 'unist-util-visit'

// Wraps characters that JSX treats as syntax in text nodes as {"$&"} string
// expressions, so the serialized HTML string survives JsxParser and the
// characters render literally.
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
  }
