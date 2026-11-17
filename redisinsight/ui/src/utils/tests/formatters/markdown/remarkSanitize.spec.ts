import type { Root } from 'mdast'
import { remarkSanitize } from 'uiSrc/utils/formatters/markdown'

const buildTree = (value: string): Root => ({
  type: 'root',
  children: [{ type: 'html', value }],
})

const testCases = [
  { input: '', output: '' },
  {
    input: '<a href="https://localhost">',
    output:
      '<a href="https://localhost" target="_blank" rel="noopener noreferrer">',
  },
  { input: '<a href="/settings">', output: '<a>' },
  { input: '<a href="javascript:alert(1)">', output: '<a>' },
  { input: '<img onload="alert(1)">', output: '<img>' },
  { input: '<img src="javascript:alert(1)">', output: '<img>' },
  { input: '<img src="img.png">', output: '<img src="img.png">' },
  {
    input:
      '<div dangerouslySetInnerHTML={{"__html": "<img src=x onerror=alert(\'this.still.works\')>"}} />',
    output: '',
  },
  { input: '<script>', output: '' },
  { input: '<script>alert(1)</script>', output: '' },
]

describe('remarkSanitize', () => {
  testCases.forEach((tc) => {
    it(`should sanitize "${tc.input}" to "${tc.output}"`, () => {
      const tree = buildTree(tc.input)

      remarkSanitize()(tree)

      expect(tree.children[0]).toEqual({ type: 'html', value: tc.output })
    })
  })

  it('should leave non-html nodes untouched', () => {
    const tree: Root = {
      type: 'root',
      children: [{ type: 'text', value: 'plain text' }],
    }

    remarkSanitize()(tree)

    expect(tree.children[0]).toEqual({ type: 'text', value: 'plain text' })
  })

  it('should not treat closing tags as sanitizable opening tags', () => {
    const tree = buildTree('</div>')

    remarkSanitize()(tree)

    expect(tree.children[0]).toEqual({ type: 'html', value: '</div>' })
  })
})
