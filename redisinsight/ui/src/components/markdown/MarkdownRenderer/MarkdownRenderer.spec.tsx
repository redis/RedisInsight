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
  RedisInsightLink: ({ url, text }: any) => (
    <a data-testid="ri-link" href={url}>
      {text}
    </a>
  ),
  CloudLink: ({ url, text }: any) => (
    <a data-testid="cloud-link" href={url}>
      {text}
    </a>
  ),
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

  it('drops javascript: links and renders an inert (non-navigable) anchor', () => {
    render(
      <MarkdownRenderer path="/tutorials/x/page.md" components={leaves}>
        {'[x](javascript:alert(1))'}
      </MarkdownRenderer>,
    )
    // safeUrl neutralizes the dangerous scheme to an empty href; the anchor
    // must stay inert rather than falling through to getFileUrlFromMd, which
    // would resolve the empty href into a navigable page.md URL.
    const link = screen.getByText('x')
    expect(link.tagName).toBe('A')
    expect(link).not.toHaveAttribute('href')
    expect(screen.queryByTestId('ext')).not.toBeInTheDocument()
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

  it('routes a redisinsight: link to the RedisInsightLink leaf with the scheme stripped', () => {
    render(
      <MarkdownRenderer components={leaves}>
        {'[Open](redisinsight:/browser)'}
      </MarkdownRenderer>,
    )
    const link = screen.getByTestId('ri-link')
    expect(link).toHaveAttribute('href', '/browser')
    expect(link).toHaveTextContent('Open')
    // safeUrl only allowlists http/https/mailto/relative, so a redisinsight:
    // href would otherwise be stripped before any component sees it; this
    // link must reach the leaf via the structured redisinsightlink node, not
    // via the sanitized href.
    expect(screen.queryByTestId('ext')).not.toBeInTheDocument()
  })

  it('preserves an in-page #anchor href unchanged', () => {
    render(
      <MarkdownRenderer path="/tutorials/x/page.md" components={leaves}>
        {'[x](#section)'}
      </MarkdownRenderer>,
    )
    expect(screen.getByRole('link', { name: 'x' })).toHaveAttribute(
      'href',
      '#section',
    )
  })

  it('routes a Redis Cloud titled link to the CloudLink leaf', () => {
    render(
      <MarkdownRenderer components={leaves}>
        {'[Try Cloud](https://redis.io/try-free "Redis Cloud")'}
      </MarkdownRenderer>,
    )
    const link = screen.getByTestId('cloud-link')
    expect(link).toHaveAttribute('href', 'https://redis.io/try-free')
    expect(link).toHaveTextContent('Try Cloud')
    expect(screen.queryByTestId('ext')).not.toBeInTheDocument()
  })
})
