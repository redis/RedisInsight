import React from 'react'

import { render, screen } from 'uiSrc/utils/test-utils'
import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

import { MessageResultCell } from './MessageResultCell'

describe('MessageResultCell', () => {
  it('should render success message when status is success', () => {
    const message = 'Database added successfully'
    render(
      <MessageResultCell
        statusAdded={AddRedisDatabaseStatus.Success}
        messageAdded={message}
      />,
    )

    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('should render error icon and text when status is not success', () => {
    const message = 'Failed to add database'
    render(
      <MessageResultCell
        statusAdded={AddRedisDatabaseStatus.Fail}
        messageAdded={message}
      />,
    )

    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('should not render success message when status is fail', () => {
    const message = 'Failed to add database'
    render(
      <MessageResultCell
        statusAdded={AddRedisDatabaseStatus.Fail}
        messageAdded={message}
      />,
    )

    expect(screen.queryByText(message)).not.toBeInTheDocument()
  })

  it('should render dash when statusAdded is undefined', () => {
    render(
      <MessageResultCell statusAdded={undefined} messageAdded="Some message" />,
    )

    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('should handle missing messageAdded gracefully', () => {
    const { container } = render(
      <MessageResultCell
        statusAdded={AddRedisDatabaseStatus.Success}
        messageAdded={undefined}
      />,
    )

    const cellText = container.querySelector('.RI-text')
    expect(cellText).toBeInTheDocument()
    expect(cellText?.textContent).toBe('')
  })
})

