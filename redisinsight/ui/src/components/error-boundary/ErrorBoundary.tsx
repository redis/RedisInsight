import React, { Component, ReactNode } from 'react'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import ErrorFallback from './ErrorFallback'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error and send telemetry
    console.error('React Error Boundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    sendEventTelemetry({
      event: TelemetryEvent.APPLICATION_CRASHED,
      eventData: {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI using ErrorFallback component
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReload={this.handleReload}
          onReset={this.handleReset}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
