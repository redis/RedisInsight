import React from 'react'
import { render, act, screen } from 'uiSrc/utils/test-utils'

import MarkdownMessage from './MarkdownMessage'

describe('MarkdownMessage', () => {
  it('should render', () => {
    expect(render(<MarkdownMessage>1</MarkdownMessage>)).toBeTruthy()
  })

  it('should render 2', async () => {
    await act(() => {
      render(<MarkdownMessage>1</MarkdownMessage>)
    })

    screen.debug(undefined, 100_000)
  })
})
