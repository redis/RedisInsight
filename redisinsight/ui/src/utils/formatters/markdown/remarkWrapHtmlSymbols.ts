import { visit } from 'unist-util-visit'

// JsxParser evaluates any `{expression}` it finds in the serialized HTML. Raw
// HTML authored in markdown (e.g. `<p>{code}</p>`) reaches it verbatim, so its
// curly braces are wrapped as {"$&"} string expressions to render literally.
//
// This runs before the formatter emits its own components (Code, Link, ...),
// whose intentional `{expr}` props must stay evaluable, and it leaves tag syntax
// like `>` untouched so raw HTML tags keep working.
export const remarkWrapHtmlSymbols =
  (): ((tree: Node) => void) => (tree: any) => {
    visit(tree, 'html', (node: any) => {
      if (node.value) {
        node.value = node.value.replace(/[{}]/g, '{"$&"}')
      }
    })
  }
