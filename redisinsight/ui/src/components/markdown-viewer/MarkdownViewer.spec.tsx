import React from 'react'
import { faker } from '@faker-js/faker'

import { render, screen } from 'uiSrc/utils/test-utils'

import { MarkdownViewer } from './MarkdownViewer'
import { MarkdownViewerProps } from './MarkdownViewer.types'

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
    delete testWindow.__pwned
  })

  it('should render container with the default data-testid', () => {
    renderComponent()

    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()
  })

  it('should render container with a custom data-testid', () => {
    renderComponent({ 'data-testid': 'custom-markdown' })

    expect(screen.getByTestId('custom-markdown')).toBeInTheDocument()
  })

  it('should render representative GFM markdown output', () => {
    const value =
      '# Title\n\n' +
      '**bold**\n\n' +
      '- first item\n\n' +
      '| name |\n| --- |\n| redis |\n\n' +
      '```\nconst x = 1\n```\n\n' +
      '[Redis](https://redis.io)'
    renderComponent({ value })

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
    renderComponent({ value })

    const text = screen.getByText(value)
    expect(text.tagName).toBe('P')
  })

  it('should render {, } and > characters literally', () => {
    // Rendered as HTML, not parsed as JSX: braces are literal text and a
    // mid-line `>` is not treated as a blockquote marker.
    renderComponent({ value: 'values {a: 1} > threshold' })

    expect(screen.getByTestId('markdown-viewer')).toHaveTextContent(
      'values {a: 1} > threshold',
    )
  })

  it('should not evaluate JSX expressions embedded in raw HTML', () => {
    // DOMPurify keeps `{...}` as inert text; a JSX parser would execute it.
    const value =
      '<div>{"".constructor.constructor("window.__pwned = true")()}</div>'
    renderComponent({ value })

    const container = screen.getByTestId('markdown-viewer')
    expect(container).toHaveTextContent(
      '{"".constructor.constructor("window.__pwned = true")()}',
    )
    expect(testWindow.__pwned).toBeUndefined()
  })

  it('should preserve target="_blank" on external links and add rel', () => {
    const value = '<a href="https://redis.io" target="_blank">site</a>'
    renderComponent({ value })

    const link = screen.getByText('site')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should add target="_blank" and rel to absolute links that lack them', () => {
    // DOMPurify's afterSanitizeAttributes hook (registered by remarkSanitize)
    // marks absolute links to open in a new tab and hardens them against
    // reverse tabnabbing.
    renderComponent({ value: '[site](https://redis.io)' })

    const link = screen.getByText('site')
    expect(link).toHaveAttribute('href', 'https://redis.io')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('should strip javascript: hrefs from links', () => {
    renderComponent({ value: '[click](javascript:window.__pwned=true)' })

    const link = screen.getByText('click')
    expect(link.hasAttribute('href')).toBe(false)
    expect(testWindow.__pwned).toBeUndefined()
  })

  it('should strip relative hrefs from links', () => {
    renderComponent({ value: '[local](/relative/path)' })

    const link = screen.getByText('local')
    expect(link.hasAttribute('href')).toBe(false)
  })

  describe('hardening', () => {
    it('should not render script elements or execute them', () => {
      const value = 'before\n\n<script>window.__pwned = true</script>\n\nafter'
      renderComponent({ value })

      const container = screen.getByTestId('markdown-viewer')
      expect(container.querySelector('script')).toBeNull()
      expect(container.querySelector('p')).toHaveTextContent('before')
      expect(testWindow.__pwned).toBeUndefined()
    })

    it('should strip on* attributes', () => {
      const value = '<p onclick="window.__pwned = true">text</p>'
      renderComponent({ value })

      const paragraph = screen.getByText('text')
      expect(paragraph.hasAttribute('onclick')).toBe(false)
      expect(testWindow.__pwned).toBeUndefined()
    })

    it('should not render images that could load remote resources', () => {
      const value =
        'before\n\n<img src="https://evil.example/pixel.png" alt="tracker">\n\nafter'
      renderComponent({ value })

      const container = screen.getByTestId('markdown-viewer')
      expect(container.querySelector('img')).toBeNull()
      expect(container).toHaveTextContent('before')
      expect(container).toHaveTextContent('after')
    })

    it('should not render media or embedding elements', () => {
      const value =
        '<video src="https://evil.example/v.mp4"></video>\n\n' +
        '<audio src="https://evil.example/a.mp3"></audio>\n\n' +
        '<svg><image href="https://evil.example/x"></image></svg>\n\n' +
        'safe'
      renderComponent({ value })

      const container = screen.getByTestId('markdown-viewer')
      expect(container.querySelector('video')).toBeNull()
      expect(container.querySelector('audio')).toBeNull()
      expect(container.querySelector('svg')).toBeNull()
      expect(container).toHaveTextContent('safe')
    })

    it('should strip style attributes', () => {
      const value =
        '<p style="background: url(https://evil.example)">styled</p>'
      renderComponent({ value })

      const paragraph = screen.getByText('styled')
      expect(paragraph.hasAttribute('style')).toBe(false)
    })

    it('should not render iframe and link elements', () => {
      const value =
        '<iframe src="https://evil.example"></iframe>\n\n' +
        '<link rel="stylesheet" href="https://evil.example/x.css">\n\n' +
        'safe'
      renderComponent({ value })

      const container = screen.getByTestId('markdown-viewer')
      expect(container.querySelector('iframe')).toBeNull()
      expect(container.querySelector('link')).toBeNull()
      expect(container).toHaveTextContent('safe')
    })

    it('should keep rendering surrounding content when a script is embedded', () => {
      // DOMPurify strips the script and keeps the surrounding nodes.
      const value = '# Title\n\n<script>window.__pwned = true</script>\n\nafter'
      renderComponent({ value })

      const container = screen.getByTestId('markdown-viewer')
      expect(container.querySelector('script')).toBeNull()
      expect(container.querySelector('h1')).toHaveTextContent('Title')
      expect(container).toHaveTextContent('after')
      expect(testWindow.__pwned).toBeUndefined()
    })
  })

  it('should render an empty value without crashing', () => {
    renderComponent({ value: '' })

    expect(screen.getByTestId('markdown-viewer')).toBeInTheDocument()
  })

  it('should fall back to the raw value as plain text when the pipeline throws', () => {
    // remark-parse throws on a non-string input; the component then renders
    // the raw value as text instead of crashing.
    const value = {
      toString: () => 'raw *value*',
    } as unknown as string
    renderComponent({ value })

    const container = screen.getByTestId('markdown-viewer')
    expect(container).toHaveTextContent('raw *value*')
    expect(container.querySelector('em')).toBeNull()
  })
})
