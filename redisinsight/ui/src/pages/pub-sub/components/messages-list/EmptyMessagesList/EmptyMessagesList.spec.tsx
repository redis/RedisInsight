import React from 'react'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { render, screen } from 'uiSrc/utils/test-utils'

import EmptyMessagesList from './EmptyMessagesList'

describe('EmptyMessagesList', () => {
  it('renders base layout and copy', () => {
    render(<EmptyMessagesList isSpublishNotSupported />)

    expect(screen.getByTestId('empty-messages-list')).toBeInTheDocument()

    expect(screen.getByText('You are not subscribed')).toBeInTheDocument()
    expect(
      screen.getByText(
        /Subscribe to the Channel to see all the messages published to your database/i,
      ),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        /Running in production may decrease performance and memory available\./i,
      ),
    ).toBeInTheDocument()
  })

  it('shows cluster banner only when Cluster AND isSpublishNotSupported=true', () => {
    // visible when both conditions true
    const { rerender } = render(
      <EmptyMessagesList
        connectionType={ConnectionType.Cluster}
        isSpublishNotSupported
      />,
    )
    const banner = screen.getByTestId('empty-messages-list-cluster')
    expect(banner).toBeInTheDocument()
    expect(
      screen.getByText(
        /Messages published with SPUBLISH will not appear in this channel/i,
      ),
    ).toBeInTheDocument()

    // hide when flag is false
    rerender(
      <EmptyMessagesList
        connectionType={ConnectionType.Cluster}
        isSpublishNotSupported={false}
      />,
    )
    expect(
      screen.queryByTestId('empty-messages-list-cluster'),
    ).not.toBeInTheDocument()

    // hide when connection is not Cluster
    rerender(
      <EmptyMessagesList
        connectionType={ConnectionType.Standalone}
        isSpublishNotSupported
      />,
    )
    expect(
      screen.queryByTestId('empty-messages-list-cluster'),
    ).not.toBeInTheDocument()

    // also hide when connectionType is undefined
    rerender(<EmptyMessagesList isSpublishNotSupported />)
    expect(
      screen.queryByTestId('empty-messages-list-cluster'),
    ).not.toBeInTheDocument()
  })
})
