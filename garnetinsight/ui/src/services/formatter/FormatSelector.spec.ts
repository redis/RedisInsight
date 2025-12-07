import FormatSelector from './FormatSelector'
import HtmlToJsxString from './HtmlToJsxString'
import MarkdownToJsxString from './MarkdownToJsxString'

describe('FormatSelector', () => {
  it('should select correct formatter for html ', () => {
    expect(FormatSelector.selectFor('html')).toBeInstanceOf(HtmlToJsxString)
  })
  it('should select correct formatter for markdown ', () => {
    expect(FormatSelector.selectFor('md')).toBeInstanceOf(MarkdownToJsxString)
  })
  it('should throw unsupported format error', () => {
    try {
      FormatSelector.selectFor('mp4')
    } catch (e) {
      expect(e.message).toBe('Unsupported format')
    }
  })
})
