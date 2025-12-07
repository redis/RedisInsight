import React from 'react'
import { instance, mock } from 'ts-mockito'
import { fireEvent, render, screen } from 'uiSrc/utils/test-utils'
import { rdiTestConnectionsSelector } from 'uiSrc/slices/rdi/testConnections'

import TestConnectionsPanel, { Props } from './TestConnectionsPanel'

const mockedProps = mock<Props>()

jest.mock('uiSrc/slices/rdi/testConnections', () => ({
  ...jest.requireActual('uiSrc/slices/rdi/testConnections'),
  rdiTestConnectionsSelector: jest.fn().mockReturnValue({
    loading: false,
  }),
}))

describe('TestConnectionsPanel', () => {
  it('should render', () => {
    render(<TestConnectionsPanel {...instance(mockedProps)} />)
  })

  it('should call onClose', () => {
    const mockOnClose = jest.fn()
    render(<TestConnectionsPanel onClose={mockOnClose} />)

    fireEvent.click(screen.getByTestId('close-test-connections-btn'))

    expect(mockOnClose).toBeCalled()
  })

  it('should render loading', () => {
    const rdiTestConnectionsSelectorMock = jest.fn().mockReturnValue({
      loading: true,
    })
    ;(rdiTestConnectionsSelector as jest.Mock).mockImplementation(
      rdiTestConnectionsSelectorMock,
    )

    render(<TestConnectionsPanel {...instance(mockedProps)} />)

    expect(screen.getByTestId('test-connections-loader')).toBeInTheDocument()
  })

  it('should show "No results found" when results are null', () => {
    ;(rdiTestConnectionsSelector as jest.Mock).mockReturnValue({
      loading: false,
      results: null,
    })

    render(<TestConnectionsPanel {...instance(mockedProps)} />)

    expect(
      screen.getByText('No results found. Please try again.'),
    ).toBeInTheDocument()
  })

  it('should render TestConnectionsLog for source and target connections', async () => {
    const mockResults = {
      source: {
        success: [],
        fail: [
          {
            target: 'source',
            error: 'Something bad happened',
          },
        ],
      },
      target: {
        success: [
          {
            target: 'Test-target-connection',
          },
        ],
        fail: [],
      },
    }

    ;(rdiTestConnectionsSelector as jest.Mock).mockReturnValue({
      loading: false,
      results: mockResults,
    })

    render(<TestConnectionsPanel {...instance(mockedProps)} />)

    expect(screen.getByText('Source connections')).toBeInTheDocument()
    expect(screen.getByText('source')).toBeInTheDocument()
    expect(screen.getByText('Something bad happened')).toBeInTheDocument()

    expect(screen.getByText('Target connections')).toBeInTheDocument()
    expect(screen.getByText('Test-target-connection')).toBeInTheDocument()
    expect(screen.getByText('Successful')).toBeInTheDocument()
  })
})
