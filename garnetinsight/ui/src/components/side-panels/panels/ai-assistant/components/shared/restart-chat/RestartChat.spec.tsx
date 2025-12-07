import React from 'react'
import {
  fireEvent,
  render,
  screen,
  waitForRiPopoverVisible,
} from 'uiSrc/utils/test-utils'

import RestartChat from './RestartChat'

const button = <button data-testid="anchor-btn" />

describe('RestartChat', () => {
  it('should render', () => {
    expect(
      render(<RestartChat button={button} onConfirm={jest.fn()} />),
    ).toBeTruthy()
  })

  it('should call onConfirm', async () => {
    const onConfirm = jest.fn()
    render(<RestartChat button={button} onConfirm={onConfirm} />)

    fireEvent.click(screen.getByTestId('anchor-btn'))

    await waitForRiPopoverVisible()

    fireEvent.click(screen.getByTestId('ai-chat-restart-confirm'))

    expect(onConfirm).toBeCalled()
  })
})
