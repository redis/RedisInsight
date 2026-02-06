import React from 'react'
import { render, screen, fireEvent, cleanup } from 'uiSrc/utils/test-utils'

import AzureTokenExpiredErrorContent from './AzureTokenExpiredErrorContent'

const mockInitiateLogin = jest.fn()
jest.mock('uiSrc/components/hooks/useAzureAuth', () => ({
  useAzureAuth: () => ({
    initiateLogin: mockInitiateLogin,
    loading: false,
  }),
}))

describe('AzureTokenExpiredErrorContent', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('should render error text and sign in button', () => {
    render(<AzureTokenExpiredErrorContent text="Token has expired" />)

    expect(screen.getByText('Token has expired')).toBeInTheDocument()
    expect(screen.getByTestId('azure-sign-in-btn')).toBeInTheDocument()
    expect(screen.getByTestId('azure-sign-in-btn')).toHaveTextContent(
      'Sign in to Azure',
    )
  })

  it('should call initiateLogin and onClose when sign in button is clicked', () => {
    const onClose = jest.fn()
    render(
      <AzureTokenExpiredErrorContent
        text="Token has expired"
        onClose={onClose}
      />,
    )

    fireEvent.click(screen.getByTestId('azure-sign-in-btn'))

    expect(mockInitiateLogin).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('should work without onClose callback', () => {
    render(<AzureTokenExpiredErrorContent text="Token has expired" />)

    // Should not throw when clicking without onClose
    expect(() => {
      fireEvent.click(screen.getByTestId('azure-sign-in-btn'))
    }).not.toThrow()

    expect(mockInitiateLogin).toHaveBeenCalled()
  })
})
