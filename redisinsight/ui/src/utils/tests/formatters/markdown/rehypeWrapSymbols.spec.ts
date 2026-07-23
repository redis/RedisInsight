import { visit } from 'unist-util-visit'
import { rehypeWrapSymbols } from 'uiSrc/utils/formatters/markdown'

// unist-util-visit is already stubbed via moduleNameMapper; jest.mock() here
// would shadow that shared instance with a per-spec automock the production
// import never sees.

const mockVisitWith = (node: { value?: string }) => {
  ;(visit as jest.Mock).mockImplementation(
    (_tree: any, _name: string, callback: (node: any) => void) => {
      callback(node)
    },
  )
}

describe('rehypeWrapSymbols', () => {
  it('should visit text nodes', () => {
    mockVisitWith({ value: '' })

    const tree = {} as Node
    rehypeWrapSymbols()(tree)

    expect(visit).toBeCalledWith(tree, 'text', expect.any(Function))
  })

  it('should wrap {, } and > as JSX string expressions', () => {
    const node = { value: 'values {a: 1} > threshold' }
    mockVisitWith(node)

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('values {"{"}a: 1{"}"} {">"} threshold')
  })

  it('should leave text without special symbols unchanged', () => {
    const node = { value: 'plain text without specials' }
    mockVisitWith(node)

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('plain text without specials')
  })

  it('should leave empty values untouched', () => {
    const node = { value: '' }
    mockVisitWith(node)

    rehypeWrapSymbols()({} as Node)

    expect(node.value).toBe('')
  })

  it('should wrap only the given symbols when a custom list is passed', () => {
    const node = { value: 'a > b < c' }
    mockVisitWith(node)

    rehypeWrapSymbols(['<'])({} as Node)

    expect(node.value).toBe('a > b {"<"} c')
  })
})
