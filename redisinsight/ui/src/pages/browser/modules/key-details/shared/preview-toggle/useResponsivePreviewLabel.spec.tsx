import React from 'react'
import { act, render, screen } from 'uiSrc/utils/test-utils'

import { PREVIEW_LABEL_WIDE_MIN_WIDTH } from './PreviewToggle.constants'
import { useResponsivePreviewLabel } from './useResponsivePreviewLabel'

let resizeCallback: (entries: Array<{ contentRect: { width: number } }>) => void

// Capture the ResizeObserver callback so a test can drive width changes; the
// global test mock is a no-op that never fires it.
beforeEach(() => {
  global.ResizeObserver = jest.fn().mockImplementation((cb) => {
    resizeCallback = cb
    return { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() }
  }) as unknown as typeof ResizeObserver
})

const Harness = () => {
  const { containerRef, isWide } = useResponsivePreviewLabel()
  return (
    <div ref={containerRef} data-testid="host">
      {String(isWide)}
    </div>
  )
}

const emitWidth = (width: number) =>
  act(() => resizeCallback([{ contentRect: { width } }]))

describe('useResponsivePreviewLabel', () => {
  it('starts narrow before the first measurement', () => {
    render(<Harness />)

    expect(screen.getByTestId('host')).toHaveTextContent('false')
  })

  it('becomes wide at or above the breakpoint and narrow below it', () => {
    render(<Harness />)

    emitWidth(PREVIEW_LABEL_WIDE_MIN_WIDTH)
    expect(screen.getByTestId('host')).toHaveTextContent('true')

    emitWidth(PREVIEW_LABEL_WIDE_MIN_WIDTH - 1)
    expect(screen.getByTestId('host')).toHaveTextContent('false')
  })
})
