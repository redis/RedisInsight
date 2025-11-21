import React from 'react'
import { fireEvent, act } from '@testing-library/react'

import { render, screen, waitForRiTooltipVisible } from 'uiSrc/utils/test-utils'
import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

import { MessageResultCellRenderer } from './MessageResultCell'

describe('MessageResultCellRenderer', () => {
  it('should render success message when status is success', () => {
    const message = 'Database added successfully'
    render(
      <MessageResultCellRenderer
        statusAdded={AddRedisDatabaseStatus.Success}
        messageAdded={message}
      />,
    )

    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('should render error icon and text when status is not success', async () => {
    const message = 'Failed to add database'
    render(
      <MessageResultCellRenderer
        statusAdded={AddRedisDatabaseStatus.Fail}
        messageAdded={message}
      />,
    )

    expect(screen.getByText('Error')).toBeInTheDocument()

    const errorText = screen.getByText('Error')
    const tooltipWrapper = errorText.closest('span')
    expect(tooltipWrapper).toBeInTheDocument()

    await act(async () => {
      fireEvent.focus(tooltipWrapper!)
    })
    await waitForRiTooltipVisible()

    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('should not render success message when status is fail', () => {
    const message = 'Failed to add database'
    render(
      <MessageResultCellRenderer
        statusAdded={AddRedisDatabaseStatus.Fail}
        messageAdded={message}
      />,
    )

    expect(screen.queryByText(message)).not.toBeInTheDocument()
  })

  it('should render dash when statusAdded is undefined', () => {
    render(
      <MessageResultCellRenderer
        statusAdded={undefined}
        messageAdded="Some message"
      />,
    )

    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('should handle missing messageAdded gracefully', () => {
    const { container } = render(
      <MessageResultCellRenderer
        statusAdded={AddRedisDatabaseStatus.Success}
        messageAdded={undefined}
      />,
    )

    const cellText = container.querySelector('.RI-text')
    expect(cellText).toBeInTheDocument()
    expect(cellText?.textContent).toBe('')
  })
})
