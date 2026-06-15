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

const SentryErrorBoundary = ({ children, fallback }: Props): JSX.Element => (
  <ErrorBoundary fallback={fallback} onError={reportToSentry}>
    {children}
  </ErrorBoundary>
)

export default SentryErrorBoundary
