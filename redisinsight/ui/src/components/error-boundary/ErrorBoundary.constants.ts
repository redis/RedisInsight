import { Palette } from './ErrorBoundary.types'

/**
 * Colors are inlined here rather than read from the redis-ui theme. The error
 * boundary renders ABOVE `ThemeProvider`, so `useTheme()` / themed components
 * are unavailable and the theme's CSS variables (injected via
 * `createGlobalStyle`) are unmounted exactly when an error is caught. The
 * values below mirror redis-ui semantic neutral/primary tokens. The only theme
 * state that survives a crash is the `theme_*` class `themeService` sets on
 * `document.body`, which `getPalette` reads to pick the matching palette.
 */
export const DARK_PALETTE: Palette = {
  bg: '#1a1a1a',
  text: '#dbdbdb',
  subdued: '#9b9b9b',
  surface: '#2a2a2a',
  border: '#3a3a3a',
  primary: '#0070f3',
  primaryText: '#ffffff',
}

export const LIGHT_PALETTE: Palette = {
  bg: '#ffffff',
  text: '#01112a',
  subdued: '#6d6e71',
  surface: '#f1f3f4',
  border: '#e6e6e6',
  primary: '#0070f3',
  primaryText: '#ffffff',
}

export const ERROR_TITLE = 'Something went wrong'
export const ERROR_MESSAGE =
  "An unexpected error occurred. We've been notified about the issue. Please reload the page and try again."
export const RELOAD_LABEL = 'Reload'
