import React from 'react'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { faker } from '@faker-js/faker'

import { render, screen } from 'uiSrc/utils/test-utils'
import { remarkSanitize } from 'uiSrc/utils/formatters/markdown'

import { MarkdownViewer } from './MarkdownViewer'
import { MarkdownViewerProps } from './MarkdownViewer.types'

// The unified pipeline is mocked via moduleNameMapper (shared jest.fn stubs), so
// these tests control the serialized HTML the component would emit and cover how
// the real DOMPurify sanitize hardens it before it is rendered. Full markdown
// conversion is covered by e2e.
interface PipelineOptions {
  html?: string
  shouldThrow?: boolean
}

const setupPipeline = ({
  html = '',
  shouldThrow = false,
}: PipelineOptions = {}) => {
  const use = jest.fn()
  const processSync = jest.fn(() => {
    if (shouldThrow) {
      throw new Error('markdown parse failed')
    }
    return html
  })
  const chain = { use, processSync }
  use.mockReturnValue(chain)
  ;(unified as unknown as jest.Mock).mockReturnValue(chain)
  return { use, processSync }
}

const testWindow = window as unknown as { __pwned?: boolean }

describe('MarkdownViewer', () => {
  const defaultProps: MarkdownViewerProps = {
    value: faker.lorem.sentence(),
  }

  const renderComponent = (propsOverride?: Partial<MarkdownViewerProps>) => {
    const props = { ...defaultProps, ...propsOverride }

    return render(<MarkdownViewer {...props} />)
  }

  beforeEach(() => {
    jest.clearAllMocks()
    delete testWindow.__pwned
  })

  it('should render container with the default data-testid', () => {
    setupPipeline({ html: '<p>hello</p>' })
    renderComponent()

    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()
  })

  it('should render container with a custom data-testid', () => {
    setupPipeline({ html: '<p>hello</p>' })
    renderComponent({ 'data-testid': 'custom-markdown' })

    expect(screen.getByTestId('custom-markdown')).toBeInTheDocument()
  })

  it('should run the pipeline with the required plugins in order and pass the value', () => {
    const value = '# Title'
    const { use, processSync } = setupPipeline({ html: '<h1>Title</h1>' })

    renderComponent({ value })

    // remark-rehype's jest mock has no default export, so its slot asserts
    // undefined plus the options object.
    expect(use.mock.calls).toEqual([
      [remarkParse],
      [remarkSanitize],
      [remarkGfm],
      [remarkRehype, { allowDangerousHtml: true }],
      [rehypeStringify, { allowDangerousHtml: true }],
    ])
    expect(processSync).toBeCalledWith(value)
  })

  it('should render representative GFM pipeline output', () => {
    setupPipeline({
      html:
        '<h1>Title</h1>' +
        '<p><strong>bold</strong></p>' +
        '<ul><li>first item</li></ul>' +
        '<table><thead><tr><th>name</th></tr></thead>' +
        '<tbody><tr><td>redis</td></tr></tbody></table>' +
        '<pre><code>const x = 1</code></pre>' +
        '<p><a href="https://redis.io" target="_blank">Redis</a></p>',
    })
    renderComponent()

    const container = screen.getByTestId('markdown-viewer')
    expect(container.querySelector('h1')).toHaveTextContent('Title')
    expect(container.querySelector('strong')).toHaveTextContent('bold')
    expect(container.querySelector('ul li')).toHaveTextContent('first item')
    expect(container.querySelector('table th')).toHaveTextContent('name')
    expect(container.querySelector('table td')).toHaveTextContent('redis')
    expect(container.querySelector('pre code')).toHaveTextContent('const x = 1')
    expect(container.querySelector('a')).toHaveAttribute(
      'href',
      'https://redis.io',
    )
  })

  it('should render plain text as a paragraph, unchanged', () => {
    const value = 'just some plain text'
    setupPipeline({ html: `<p>${value}</p>` })
    renderComponent({ value })

    const text = screen.getByText(value)
    expect(text.tagName).toBe('P')
  })

  it('should render {, } and > characters literally', () => {
    // Rendered as HTML, not parsed as JSX, so braces are literal text.
    setupPipeline({ html: '<p>values {a: 1} &#x3E; threshold</p>' })
    renderComponent({ value: 'values {a: 1} > threshold' })

    expect(screen.getByTestId('markdown-viewer')).toHaveTextContent(
      'values {a: 1} > threshold',
    )
  })

  it('should not evaluate JSX expressions embedded in raw HTML', () => {
    // DOMPurify keeps `{...}` as inert text; a JSX parser would execute it.
    setupPipeline({
      html: '<div>{"".constructor.constructor("window.__pwned = true")()}</div>',
    })
    renderComponent({ value: 'irrelevant' })

    const container = screen.getByTestId('markdown-viewer')
    expect(container).toHaveTextContent(
      '{"".constructor.constructor("window.__pwned = true")()}',
    )
    expect(testWindow.__pwned).toBeUndefined()
  })

  it('should preserve target="_blank" on external links', () => {
    setupPipeline({
      html: '<p><a href="https://redis.io" target="_blank">site</a></p>',
    })
    renderComponent()

    const link = screen.getByText('site')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should add target="_blank" and rel to absolute links that lack it', () => {
    // DOMPurify's afterSanitizeAttributes hook (registered by remarkSanitize)
    // marks absolute links to open in a new tab and hardens them against
    // reverse tabnabbing.
    setupPipeline({ html: '<p><a href="https://redis.io">site</a></p>' })
    renderComponent()

    const link = screen.getByText('site')
    expect(link).toHaveAttribute('href', 'https://redis.io')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should strip javascript: hrefs from links', () => {
    setupPipeline({
      html: '<p><a href="javascript:window.__pwned = true">click</a></p>',
    })
    renderComponent()

    const link = screen.getByText('click')
    expect(link.hasAttribute('href')).toBe(false)
    expect(testWindow.__pwned).toBeUndefined()
  })

  it('should strip relative hrefs from links', () => {
    setupPipeline({ html: '<p><a href="/relative/path">local</a></p>' })
    renderComponent()

    const link = screen.getByText('local')
    expect(link.hasAttribute('href')).toBe(false)
  })

  describe('hardening', () => {
    it('should not render script elements or execute them', () => {
      setupPipeline({
        html: '<p>before</p><script>window.__pwned = true</script>',
      })
      renderComponent()

      const container = screen.getByTestId('markdown-viewer')
      expect(container.querySelector('script')).toBeNull()
      expect(container.querySelector('p')).toHaveTextContent('before')
      expect(testWindow.__pwned).toBeUndefined()
    })

    it('should strip on* attributes', () => {
      setupPipeline({
        html: '<p><img src="x" onerror="window.__pwned = true"></p>',
      })
      renderComponent()

      const img = screen
        .getByTestId('markdown-viewer')
        .querySelector('img') as HTMLImageElement
      expect(img).not.toBeNull()
      expect(img.hasAttribute('onerror')).toBe(false)
      expect(testWindow.__pwned).toBeUndefined()
    })

    it('should strip style attributes', () => {
      setupPipeline({
        html: '<p style="background: url(https://evil.example)">styled</p>',
      })
      renderComponent()

      const paragraph = screen.getByText('styled')
      expect(paragraph.hasAttribute('style')).toBe(false)
    })

    it('should not render iframe and link elements', () => {
      setupPipeline({
        html:
          '<iframe src="https://evil.example"></iframe>' +
          '<link rel="stylesheet" href="https://evil.example/x.css">' +
          '<p>safe</p>',
      })
      renderComponent()

      const container = screen.getByTestId('markdown-viewer')
      expect(container.querySelector('iframe')).toBeNull()
      expect(container.querySelector('link')).toBeNull()
      expect(container.querySelector('p')).toHaveTextContent('safe')
    })

    it('should keep rendering surrounding content when a script is embedded', () => {
      // DOMPurify strips the script and keeps the surrounding nodes.
      setupPipeline({
        html:
          '<h1>Title</h1>' +
          '<script>window.__pwned = true</script>' +
          '<p>after</p>',
      })
      renderComponent()

      const container = screen.getByTestId('markdown-viewer')
      expect(container.querySelector('script')).toBeNull()
      expect(container.querySelector('h1')).toHaveTextContent('Title')
      expect(container.querySelector('p')).toHaveTextContent('after')
      expect(testWindow.__pwned).toBeUndefined()
    })
  })

  it('should render an empty value without crashing', () => {
    const { processSync } = setupPipeline({ html: '' })
    renderComponent({ value: '' })

    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()
    expect(processSync).toBeCalledWith('')
  })

  it('should fall back to the raw value as plain text when the pipeline throws', () => {
    const value = '# Title *raw*'
    setupPipeline({ shouldThrow: true })
    renderComponent({ value })

    const container = screen.getByTestId('markdown-viewer')
    expect(container).toHaveTextContent(value)
    expect(container.querySelector('h1')).toBeNull()
  })
})
