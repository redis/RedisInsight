import React, { Component, ErrorInfo, ReactNode } from 'react'
import * as Sentry from '@sentry/react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

interface Palette {
  bg: string
  text: string
  subdued: string
  surface: string
  border: string
  primary: string
  primaryText: string
}

/**
 * Colors are inlined here on purpose rather than read from the redis-ui theme.
 * This boundary renders ABOVE `ThemeProvider`, so `useTheme()` / themed
 * components are unavailable and the theme's CSS variables (injected via
 * `createGlobalStyle`) are unmounted exactly when an error is caught. The
 * values below mirror redis-ui semantic neutral/primary tokens. The only theme
 * state that survives a crash is the `theme_*` class `themeService` sets on
 * `document.body`, which we use to pick the matching palette.
 */
const DARK_PALETTE: Palette = {
  bg: '#1a1a1a',
  text: '#dbdbdb',
  subdued: '#9b9b9b',
  surface: '#2a2a2a',
  border: '#3a3a3a',
  primary: '#0070f3',
  primaryText: '#ffffff',
}

const LIGHT_PALETTE: Palette = {
  bg: '#ffffff',
  text: '#01112a',
  subdued: '#6d6e71',
  surface: '#f1f3f4',
  border: '#e6e6e6',
  primary: '#0070f3',
  primaryText: '#ffffff',
}

const getPalette = (): Palette => {
  try {
    const { classList } = document.body
    if (classList.contains('theme_light')) return LIGHT_PALETTE
    if (classList.contains('theme_dark')) return DARK_PALETTE
    return window.matchMedia?.('(prefers-color-scheme: light)').matches
      ? LIGHT_PALETTE
      : DARK_PALETTE
  } catch {
    return DARK_PALETTE
  }
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
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
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

      const palette = getPalette()

      // Default error UI. Hierarchy: the title is the focal point (what
      // happened), supported by muted explanatory copy, an optional collapsed
      // error detail, and a proportionate primary recovery action.
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '24px',
            textAlign: 'center',
            backgroundColor: palette.bg,
            color: palette.text,
          }}
        >
          <h1
            style={{
              margin: '0 0 12px',
              fontSize: '28px',
              fontWeight: 600,
              lineHeight: 1.25,
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              margin: '0 0 24px',
              maxWidth: '480px',
              fontSize: '15px',
              lineHeight: 1.5,
              color: palette.subdued,
            }}
          >
            An unexpected error occurred. We've tracked it and will look into
            it. Please refresh the page and try again.
          </p>
          {error && (
            <pre
              style={{
                margin: '0 0 24px',
                padding: '12px 16px',
                maxWidth: '480px',
                overflow: 'auto',
                textAlign: 'left',
                fontSize: '12px',
                color: palette.subdued,
                backgroundColor: palette.surface,
                border: `1px solid ${palette.border}`,
                borderRadius: '8px',
              }}
            >
              {error.message}
            </pre>
          )}
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 500,
              color: palette.primaryText,
              backgroundColor: palette.primary,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      )
    }

    return children
  }
}

export default SentryErrorBoundary
