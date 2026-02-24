import React, { Component, ErrorInfo, ReactNode } from 'react'
import { captureException } from 'uiSrc/services/sentry'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary component that captures React errors and reports them to Sentry.
 * Wraps the application to catch and report component-level errors.
 */
class SentryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Capture the error and send to Sentry
    captureException(error, {
      componentStack: errorInfo.componentStack,
    })
  }

  render(): ReactNode {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError) {
      // Render custom fallback UI if provided
      if (fallback) {
        return fallback
      }

      // TODO: Design
      // Default error UI
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: '#1a1a2e',
            color: '#fff',
          }}
        >
          <h1 style={{ marginBottom: '16px' }}>Something went wrong</h1>
          <p style={{ marginBottom: '24px', color: '#888' }}>
            An unexpected error occurred. Please refresh the page and try again.
          </p>
          {error && (
            <pre
              style={{
                padding: '12px',
                backgroundColor: '#2a2a4e',
                borderRadius: '8px',
                maxWidth: '600px',
                overflow: 'auto',
                fontSize: '12px',
              }}
            >
              {error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: '24px',
              padding: '12px 24px',
              backgroundColor: '#dc382c',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            Refresh Page
          </button>
        </div>
      )
    }

    return children
  }
}

export default SentryErrorBoundary
