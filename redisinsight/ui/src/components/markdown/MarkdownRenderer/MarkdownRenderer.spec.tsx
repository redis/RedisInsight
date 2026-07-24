import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import { MarkdownRenderer } from './MarkdownRenderer'

const leaves = {
  RedisCode: ({ children, label }: any) => (
    <div data-testid="rediscode" data-label={label}>
      {children}
    </div>
  ),
  ExternalLink: ({ href, children }: any) => (
    <a data-testid="ext" href={href}>
      {children}
    </a>
  ),
  Image: ({ src }: any) => <img data-testid="img" src={src} alt="" />,
}

describe('MarkdownRenderer', () => {
  it('renders a redis code fence via the RedisCode leaf', () => {
    render(
      <MarkdownRenderer components={leaves}>
        {'```redis Run me\nGET k\n```'}
      </MarkdownRenderer>,
    )
    const el = screen.getByTestId('rediscode')
    expect(el).toHaveAttribute('data-label', 'Run me')
    expect(el).toHaveTextContent('GET k')
  })

  it('does not execute JSX expressions in raw HTML (renders as text)', () => {
    render(
      <MarkdownRenderer components={leaves}>
        {'<p>{alert(1)}</p>'}
      </MarkdownRenderer>,
    )
    expect(
      screen.getByText('<p>{alert(1)}</p>', { exact: false }),
    ).toBeInTheDocument()
    expect(document.querySelector('script')).toBeNull()
  })

  it('drops javascript: links', () => {
    render(
      <MarkdownRenderer components={leaves}>
        {'[x](javascript:alert(1))'}
      </MarkdownRenderer>,
    )
    const link = screen.queryByTestId('ext')
    expect(link?.getAttribute('href') ?? '').not.toContain('javascript:')
  })

  it('resolves relative image src against path', () => {
    render(
      <MarkdownRenderer path="/tutorials/x/page.md" components={leaves}>
        {'![](img.png)'}
      </MarkdownRenderer>,
    )
    expect(screen.getByTestId('img').getAttribute('src')).toContain('img.png')
  })

  it('routes a plain external link to the ExternalLink leaf', () => {
    render(
      <MarkdownRenderer components={leaves}>
        {'[Redis](https://redis.io)'}
      </MarkdownRenderer>,
    )
    const link = screen.getByTestId('ext')
    expect(link).toHaveAttribute('href', 'https://redis.io')
    expect(link).toHaveTextContent('Redis')
  })
})
