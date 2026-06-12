import { ErrorInfo, ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  /**
   * Reporting side-effect invoked when an error is caught. Called inside a
   * try/catch so a failure in the handler (e.g. the reporting SDK throwing)
   * can never prevent the fallback UI from rendering.
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export interface Palette {
  bg: string
  text: string
  subdued: string
  surface: string
  border: string
  primary: string
  primaryText: string
}
