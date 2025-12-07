import React from 'react'
import { fireEvent, screen, within } from '@testing-library/react'
import { render } from 'uiSrc/utils/test-utils'
import ConnectivityError, {
  ConnectivityErrorProps,
} from 'uiSrc/components/connectivity-error/ConnectivityError'

const defaultProps: ConnectivityErrorProps = {
  isLoading: false,
  onRetry: undefined,
  error: 'Test error',
}

const expectErrorMessage = (error: string) => {
  const errorElement = screen.getByTestId('connectivity-error-message')
  expect(within(errorElement).getByText(error)).toBeInTheDocument()
}

describe('Connectivity error component', () => {
  it('should show error message without retry button', () => {
    render(<ConnectivityError {...defaultProps} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expectErrorMessage('Test error')
    expect(screen.queryByTestId('suspense-loader')).not.toBeInTheDocument()
  })

  it('should show retry button if onRetry is provided', async () => {
    const onRetry = jest.fn()

    render(<ConnectivityError {...defaultProps} onRetry={onRetry} />)
    const retryButton = await screen.findByRole('button', { name: 'Retry' })
    expect(retryButton).toBeInTheDocument()
    expectErrorMessage('Test error')

    fireEvent.click(retryButton)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should show loading when isLoading = true', async () => {
    render(<ConnectivityError {...defaultProps} isLoading />)
    expect(screen.getByTestId('suspense-loader')).toBeInTheDocument()
  })
})
