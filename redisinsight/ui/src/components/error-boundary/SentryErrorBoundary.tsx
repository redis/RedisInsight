import React, { ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/react'
import ErrorBoundary from './ErrorBoundary'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

const reportToSentry = (error: Error, errorInfo: ErrorInfo): void => {
  Sentry.captureException(error, {
    extra: { componentStack: errorInfo.componentStack },
  })
}

/**
 * Error boundary that reports caught errors to Sentry. The catch + fallback UI
 * live in the generic `ErrorBoundary`; this only injects the reporting
 * side-effect. `ErrorBoundary` invokes `onError` inside a try/catch, so a
 * Sentry failure can never stop the fallback from rendering.
 */
const SentryErrorBoundary = ({ children, fallback }: Props): JSX.Element => (
  <ErrorBoundary fallback={fallback} onError={reportToSentry}>
    {children}
  </ErrorBoundary>
)

export default SentryErrorBoundary
