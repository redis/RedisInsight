import { visit } from 'unist-util-visit'
import { rehypeWrapSymbols } from 'uiSrc/utils/formatters/markdown'

// unist-util-visit is already stubbed via moduleNameMapper; jest.mock() here
// would shadow that shared instance with a per-spec automock the production
// import never sees.

// Dispatch the mocked visit by node type, so text and raw callbacks each only
// receive the node registered for their type.
const mockVisitWith = (nodesByType: Record<string, { value?: string }>) => {
  ;(visit as jest.Mock).mockImplementation(
    (_tree: any, type: string, callback: (node: any) => void) => {
      const node = nodesByType[type]
      if (node) {
        callback(node)
      }
    },
  )
}

describe('rehypeWrapSymbols', () => {
  it('should visit text and raw nodes', () => {
    mockVisitWith({})

    const tree = {} as Node
    rehypeWrapSymbols()(tree)

    expect(visit).toBeCalledWith(tree, 'text', expect.any(Function))
    expect(visit).toBeCalledWith(tree, 'raw', expect.any(Function))
  })

  it('should wrap {, } and > in text nodes as JSX string expressions', () => {
    const node = { value: 'values {a: 1} > threshold' }
    mockVisitWith({ text: node })

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('values {"{"}a: 1{"}"} {">"} threshold')
  })

  it('should leave text without special symbols unchanged', () => {
    const node = { value: 'plain text without specials' }
    mockVisitWith({ text: node })

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('plain text without specials')
  })

  it('should wrap braces in raw HTML text content', () => {
    const node = { value: '<p>{alert(1)}</p>' }
    mockVisitWith({ raw: node })

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('<p>{"{"}alert(1){"}"}</p>')
  })

  it('should leave braces inside raw HTML attributes intact', () => {
    const node = { value: '<a href="https://redis.io/{id}">link</a>' }
    mockVisitWith({ raw: node })

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('<a href="https://redis.io/{id}">link</a>')
  })

  it('should wrap text braces but keep attribute braces in the same raw node', () => {
    const node = { value: '<a href="x/{id}">t{e}</a>' }
    mockVisitWith({ raw: node })

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('<a href="x/{id}">t{"{"}e{"}"}</a>')
  })

  it('should not treat a > inside a quoted attribute as the end of the tag', () => {
    const node = { value: '<a title="see > {id}">t{e}</a>' }
    mockVisitWith({ raw: node })

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('<a title="see > {id}">t{"{"}e{"}"}</a>')
  })

  it('should leave formatter-generated components untouched', () => {
    const node = {
      value: '<Code path={path} lang="redis">{"GET user:1"}</Code>',
    }
    mockVisitWith({ raw: node })

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe(
      '<Code path={path} lang="redis">{"GET user:1"}</Code>',
    )
  })

  it('should escape a lowercase look-alike of a component tag', () => {
    const node = { value: '<code>{evil}</code>' }
    mockVisitWith({ raw: node })

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('<code>{"{"}evil{"}"}</code>')
  })

  it('should wrap only the given symbols in text nodes when a custom list is passed', () => {
    const node = { value: 'a > b < c' }
    mockVisitWith({ text: node })

    rehypeWrapSymbols(['<'])({} as Node)

    expect(node.value).toBe('a > b {"<"} c')
  })
})
