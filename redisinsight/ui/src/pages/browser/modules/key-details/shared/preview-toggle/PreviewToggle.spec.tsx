import React from 'react'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import { PreviewToggle } from './PreviewToggle'

const TEST_ID = 'preview-toggle'
const PREVIEW_LABEL = 'Preview'
const PREVIEW_COMMAND_LABEL = 'Preview command'

describe('PreviewToggle', () => {
  it('collapses to the short label when narrow and expands when wide', () => {
    const { rerender } = render(
      <PreviewToggle
        pressed={false}
        onPressedChange={jest.fn()}
        data-testid={TEST_ID}
      />,
    )
    expect(screen.getByText(PREVIEW_LABEL)).toBeInTheDocument()
    expect(screen.queryByText(PREVIEW_COMMAND_LABEL)).not.toBeInTheDocument()

    rerender(
      <PreviewToggle
        pressed={false}
        onPressedChange={jest.fn()}
        wide
        data-testid={TEST_ID}
      />,
    )
    expect(screen.getByText(PREVIEW_COMMAND_LABEL)).toBeInTheDocument()
  })

  it('reports presses via onPressedChange', () => {
    const onPressedChange = jest.fn()
    render(
      <PreviewToggle
        pressed={false}
        onPressedChange={onPressedChange}
        data-testid={TEST_ID}
      />,
    )

    fireEvent.click(screen.getByTestId(TEST_ID))

    expect(onPressedChange).toHaveBeenCalledWith(true)
  })

  it('blocks presses while disabled', () => {
    const onPressedChange = jest.fn()
    render(
      <PreviewToggle
        pressed={false}
        onPressedChange={onPressedChange}
        disabled
        data-testid={TEST_ID}
      />,
    )

    expect(screen.getByTestId(TEST_ID)).toBeDisabled()
    fireEvent.click(screen.getByTestId(TEST_ID))
    expect(onPressedChange).not.toHaveBeenCalled()
  })
})
