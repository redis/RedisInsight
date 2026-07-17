import React from 'react'

import { cleanup, fireEvent, render, screen } from 'uiSrc/utils/test-utils'

import EmptyMessage, { EmptyMessageProps } from './EmptyMessage'

describe('EmptyMessage', () => {
  const defaultProps: EmptyMessageProps = {
    onAddClick: jest.fn(),
  }

  const renderComponent = (propsOverride?: Partial<EmptyMessageProps>) => {
    const props = { ...defaultProps, ...propsOverride }

    return render(<EmptyMessage {...props} />)
  }

  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render', () => {
    expect(renderComponent()).toBeTruthy()
  })

  it('should render the empty message copy', () => {
    renderComponent()

    expect(screen.getByTestId('agent-memory-empty-message')).toBeInTheDocument()
    expect(screen.getByText(/Inspect your agent/)).toBeInTheDocument()
    expect(
      screen.getByText(
        /gives AI agents short-term memory for the active session/,
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/plus persistent long-term memory across sessions/),
    ).toBeInTheDocument()
  })

  it('should render a link to the agent memory docs', () => {
    renderComponent()

    const link = screen.getByTestId('agent-memory-docs-link')

    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', 'https://redis.io/agent-memory/')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('should call onAddClick when the add button is clicked', () => {
    const onAddClick = jest.fn()
    renderComponent({ onAddClick })

    fireEvent.click(screen.getByTestId('agent-memory-empty-add-button'))

    expect(onAddClick).toHaveBeenCalledTimes(1)
  })
})
