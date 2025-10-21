import React from 'react'
import { render, screen, fireEvent } from 'uiSrc/utils/test-utils'
import ErrorFallback from './ErrorFallback'

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message')
  const mockErrorInfo = {
    componentStack: 'Test component stack'
  } as React.ErrorInfo

  it('should render error message and buttons', () => {
    const onReload = jest.fn()
    const onReset = jest.fn()

    render(
      <ErrorFallback
        error={mockError}
        errorInfo={mockErrorInfo}
        onReload={onReload}
        onReset={onReset}
      />
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument()
    expect(screen.getByTestId('error-boundary-reload')).toBeInTheDocument()
    expect(screen.getByTestId('error-boundary-reset')).toBeInTheDocument()
  })

  it('should call onReload when reload button is clicked', () => {
    const onReload = jest.fn()
    const onReset = jest.fn()

    render(
      <ErrorFallback
        error={mockError}
        errorInfo={mockErrorInfo}
        onReload={onReload}
        onReset={onReset}
      />
    )

    fireEvent.click(screen.getByTestId('error-boundary-reload'))
    expect(onReload).toHaveBeenCalledTimes(1)
  })

  it('should call onReset when reset button is clicked', () => {
    const onReload = jest.fn()
    const onReset = jest.fn()

    render(
      <ErrorFallback
        error={mockError}
        errorInfo={mockErrorInfo}
        onReload={onReload}
        onReset={onReset}
      />
    )

    fireEvent.click(screen.getByTestId('error-boundary-reset'))
    expect(onReset).toHaveBeenCalledTimes(1)
  })

  it('should not render buttons when handlers are not provided', () => {
    render(<ErrorFallback error={mockError} errorInfo={mockErrorInfo} />)

    expect(screen.queryByTestId('error-boundary-reload')).not.toBeInTheDocument()
    expect(screen.queryByTestId('error-boundary-reset')).not.toBeInTheDocument()
  })

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(<ErrorFallback error={mockError} errorInfo={mockErrorInfo} />)

    expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })

  it('should not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(<ErrorFallback error={mockError} errorInfo={mockErrorInfo} />)

    expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument()

    process.env.NODE_ENV = originalEnv
  })
})
