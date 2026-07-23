import { visit } from 'unist-util-visit'
import { rehypeWrapSymbols } from 'uiSrc/utils/formatters/markdown'

// unist-util-visit is already stubbed via moduleNameMapper; jest.mock() here
// would shadow that shared instance with a per-spec automock the production
// import never sees.

// Drive the visitor over an explicit list of nodes, mirroring how the real
// unist-util-visit walks every node when no test is supplied.
const mockVisitWith = (nodes: Array<{ type?: string; value?: string }>) => {
  ;(visit as jest.Mock).mockImplementation(
    (_tree: any, visitor: (node: any) => void) => {
      nodes.forEach((node) => visitor(node))
    },
  )
}

describe('rehypeWrapSymbols', () => {
  it('should visit all nodes with a single visitor', () => {
    mockVisitWith([])

    const tree = {} as Node
    rehypeWrapSymbols()(tree)

    expect(visit).toBeCalledWith(tree, expect.any(Function))
  })

  it('should wrap {, } and > in text nodes as JSX string expressions', () => {
    const node = { type: 'text', value: 'values {a: 1} > threshold' }
    mockVisitWith([node])

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('values {"{"}a: 1{"}"} {">"} threshold')
  })

  it('should wrap curly braces in raw HTML nodes but leave tag syntax intact', () => {
    const node = { type: 'raw', value: '<p>{alert(1)}</p>' }
    mockVisitWith([node])

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('<p>{"{"}alert(1){"}"}</p>')
  })

  it('should neutralize a JSX expression injection payload in a raw node', () => {
    const node = {
      type: 'raw',
      value: '<p>{({}).constructor.constructor("return 1")()}</p>',
    }
    mockVisitWith([node])

    rehypeWrapSymbols()({} as Node)

    expect(node.value).not.toMatch(/<p>\{[^"]/)
    expect(node.value).toContain('{"{"}')
    expect(node.value).toContain('{"}"}')
  })

  it('should leave text without special symbols unchanged', () => {
    const node = { type: 'text', value: 'plain text without specials' }
    mockVisitWith([node])

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('plain text without specials')
  })

  it('should leave empty values untouched', () => {
    const textNode = { type: 'text', value: '' }
    const rawNode = { type: 'raw', value: '' }
    mockVisitWith([textNode, rawNode])

    rehypeWrapSymbols()({} as Node)

    expect(textNode.value).toBe('')
    expect(rawNode.value).toBe('')
  })

  it('should ignore node types other than text and raw', () => {
    const node = { type: 'element', value: '{ignored}' }
    mockVisitWith([node])

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('{ignored}')
  })

  it('should wrap only the given symbols in text nodes when a custom list is passed', () => {
    const node = { type: 'text', value: 'a > b < c' }
    mockVisitWith([node])

    rehypeWrapSymbols(['<'])({} as Node)

    expect(node.value).toBe('a > b {"<"} c')
  })
})
