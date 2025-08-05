import React from 'react'
import { render, fireEvent } from 'uiSrc/utils/test-utils'
import { RiWindowEvent } from './RiWindowEvent'

describe('RiWindowEvent', () => {
  let windowAddCount = 0
  let windowRemoveCount = 0
  let windowAddEventListener: typeof window.addEventListener
  let windowRemoveEventListener: typeof window.removeEventListener

  beforeAll(() => {
    windowAddEventListener = window.addEventListener
    windowRemoveEventListener = window.removeEventListener
    // React 16 and 17 register a bunch of error listeners which we don't need to capture
    window.addEventListener = jest.fn((event: string) => {
      if (event !== 'error') {
        windowAddCount++
      }
    })
    window.removeEventListener = jest.fn((event: string) => {
      if (event !== 'error') {
        windowRemoveCount++
      }
    })
  })

  beforeEach(() => {
    // Reset counts
    windowAddCount = 0
    windowRemoveCount = 0
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  it('should attach handler to window event on mount', () => {
    const handler = () => null
    render(<RiWindowEvent event="click" handler={handler} />)
    expect(window.addEventListener).toHaveBeenCalledWith('click', handler)
    expect(windowAddCount).toEqual(1)
  })

  it('should remove handler on unmount', () => {
    const handler = () => null
    const { unmount } = render(
      <RiWindowEvent event="click" handler={handler} />,
    )
    unmount()
    expect(window.removeEventListener).toHaveBeenCalledWith('click', handler)
    expect(windowRemoveCount).toEqual(1)
  })

  it('should remove and re-attach handler to window event on update', () => {
    const handler1 = () => null
    const handler2 = () => null
    const { rerender } = render(
      <RiWindowEvent event="click" handler={handler1} />,
    )

    expect(window.addEventListener).toHaveBeenCalledWith('click', handler1)

    rerender(<RiWindowEvent event="keydown" handler={handler2} />)

    expect(window.removeEventListener).toHaveBeenCalledWith('click', handler1)
    expect(window.addEventListener).toHaveBeenCalledWith('keydown', handler2)
  })

  it('should not remove or re-attach handler if update is irrelevant', () => {
    const handler = () => null
    const { rerender } = render(
      <RiWindowEvent event="click" handler={handler} />,
    )
    expect(windowAddCount).toEqual(1)

    rerender(
      <RiWindowEvent
        event="click"
        handler={handler}
        data-test-subj="whatever"
      />,
    )
    expect(windowAddCount).toEqual(1)
    expect(windowRemoveCount).toEqual(0)
  })

  it('should call handler on window event', () => {
    window.addEventListener = windowAddEventListener
    window.removeEventListener = windowRemoveEventListener
    const handler = jest.fn()
    render(<RiWindowEvent event="click" handler={handler} />)
    fireEvent.click(window)
    expect(handler).toHaveBeenCalled()
    expect(handler).toHaveBeenCalledTimes(1)
  })
})
