import React, { Component, ErrorInfo, ReactNode } from 'react'
import {
  ERROR_MESSAGE,
  ERROR_TITLE,
  RELOAD_LABEL,
} from './ErrorBoundary.constants'
import { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types'
import { getPalette } from './ErrorBoundary.utils'
import {
  buttonStyle,
  containerStyle,
  detailStyle,
  messageStyle,
  titleStyle,
} from './ErrorBoundary.styles'

/**
 * Generic React error boundary: catches render errors in its subtree, renders a
 * fallback, and forwards the error to an optional `onError` handler. It has no
 * dependency on any reporting vendor — wrap it (e.g. SentryErrorBoundary) to
 * add reporting.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Never let a reporting failure escape the boundary — that would propagate
    // past it and prevent the fallback below from rendering.
    try {
      this.props.onError?.(error, errorInfo)
    } catch {
      // Intentionally swallowed: the fallback UI must always render.
    }
  }

  render(): ReactNode {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (!hasError) {
      return children
    }

    // Render custom fallback UI if provided
    if (fallback) {
      return fallback
    }

    const palette = getPalette()

    // Default error UI. Hierarchy: the title is the focal point (what
    // happened), supported by muted explanatory copy, an optional collapsed
    // error detail, and a proportionate primary recovery action.
    return (
      <div style={containerStyle(palette)}>
        <h1 style={titleStyle}>{ERROR_TITLE}</h1>
        <p style={messageStyle(palette)}>{ERROR_MESSAGE}</p>
        {error && <pre style={detailStyle(palette)}>{error.message}</pre>}
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={buttonStyle(palette)}
        >
          {RELOAD_LABEL}
        </button>
      </div>
    )
  }
}

export default ErrorBoundary
