import { visit } from 'unist-util-visit'
import { remarkWrapHtmlSymbols } from 'uiSrc/utils/formatters/markdown'

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

describe('remarkWrapHtmlSymbols', () => {
  it('should visit html nodes', () => {
    mockVisitWith({ value: '' })

    const tree = {} as Node
    remarkWrapHtmlSymbols()(tree)

    expect(visit).toBeCalledWith(tree, 'html', expect.any(Function))
  })

  it('should wrap curly braces but leave tag syntax intact', () => {
    const node = { value: '<p>{alert(1)}</p>' }
    mockVisitWith(node)

    remarkWrapHtmlSymbols()({} as Node)

    expect(node.value).toBe('<p>{"{"}alert(1){"}"}</p>')
  })

  it('should neutralize a JSX expression injection payload', () => {
    const node = {
      value: '<p>{({}).constructor.constructor("return 1")()}</p>',
    }
    mockVisitWith(node)

    remarkWrapHtmlSymbols()({} as Node)

    expect(node.value).not.toMatch(/\{(?!")/)
  })

  it('should not wrap commas', () => {
    const node = { value: '<div style="font-family: Arial, sans-serif"></div>' }
    mockVisitWith(node)

    remarkWrapHtmlSymbols()({} as Node)

    expect(node.value).toBe(
      '<div style="font-family: Arial, sans-serif"></div>',
    )
  })

  it('should leave empty values untouched', () => {
    const node = { value: '' }
    mockVisitWith(node)

    remarkWrapHtmlSymbols()({} as Node)

    expect(node.value).toBe('')
  })
})
