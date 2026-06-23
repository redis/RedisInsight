import { ErrorInfo, ReactNode } from 'react'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
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
