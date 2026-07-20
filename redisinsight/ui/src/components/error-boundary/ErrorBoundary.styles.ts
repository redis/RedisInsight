import { CSSProperties } from 'react'
import { Palette } from './ErrorBoundary.types'

/**
 * Styles are plain `CSSProperties` (inline), not styled-components: the error
 * boundary renders above `ThemeProvider`, so the themed styling system isn't
 * available when a crash is caught. See ErrorBoundary.constants for details.
 * Palette-dependent styles are functions of the resolved palette.
 */
export const containerStyle = (palette: Palette): CSSProperties => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  padding: '24px',
  textAlign: 'center',
  backgroundColor: palette.bg,
  color: palette.text,
})

export const titleStyle: CSSProperties = {
  margin: '0 0 12px',
  fontSize: '28px',
  fontWeight: 600,
  lineHeight: 1.25,
}

export const messageStyle = (palette: Palette): CSSProperties => ({
  margin: '0 0 24px',
  maxWidth: '480px',
  fontSize: '15px',
  lineHeight: 1.5,
  color: palette.subdued,
})

export const detailStyle = (palette: Palette): CSSProperties => ({
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
})

export const buttonStyle = (palette: Palette): CSSProperties => ({
  padding: '10px 20px',
  fontSize: '14px',
  fontWeight: 500,
  color: palette.primaryText,
  backgroundColor: palette.primary,
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
})
