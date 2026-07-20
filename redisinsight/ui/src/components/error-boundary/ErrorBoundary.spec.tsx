import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'
import ErrorBoundary from './ErrorBoundary'
import { ERROR_TITLE, RELOAD_LABEL } from './ErrorBoundary.constants'

const ThrowError = ({ message = 'boom' }: { message?: string }) => {
  throw new Error(message)
}

describe('ErrorBoundary', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    // React logs caught render errors to console.error; silence it for clean output.
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="child">all good</div>
      </ErrorBoundary>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.queryByText(ERROR_TITLE)).not.toBeInTheDocument()
  })

  it('renders the default fallback when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError message="kaboom" />
      </ErrorBoundary>,
    )

    expect(screen.getByText(ERROR_TITLE)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: RELOAD_LABEL }),
    ).toBeInTheDocument()
    expect(screen.getByText('kaboom')).toBeInTheDocument()
  })

  it('renders a custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>custom fallback</div>}>
        <ThrowError />
      </ErrorBoundary>,
    )

    expect(screen.getByText('custom fallback')).toBeInTheDocument()
    expect(screen.queryByText(ERROR_TITLE)).not.toBeInTheDocument()
  })

  it('forwards the caught error to onError', () => {
    const onError = jest.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError message="reported" />
      </ErrorBoundary>,
    )

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error)
    expect(onError.mock.calls[0][0].message).toBe('reported')
  })

  it('still renders the fallback when onError itself throws', () => {
    const onError = jest.fn(() => {
      throw new Error('reporting failed')
    })

    expect(() =>
      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>,
      ),
    ).not.toThrow()

    expect(onError).toHaveBeenCalledTimes(1)
    expect(screen.getByText(ERROR_TITLE)).toBeInTheDocument()
  })
})
