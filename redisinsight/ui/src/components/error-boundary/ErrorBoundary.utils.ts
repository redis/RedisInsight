import { Theme } from 'uiSrc/constants'
import { DARK_PALETTE, LIGHT_PALETTE } from './ErrorBoundary.constants'
import { Palette } from './ErrorBoundary.types'

/**
 * Pick the palette matching the active theme. Reads the `theme_<THEME>` class
 * `themeService` sets on `document.body` (the only theme state that survives a
 * crash, since it is not React-managed), falling back to the OS preference and
 * then to dark.
 */
export const getPalette = (): Palette => {
  try {
    const { classList } = document.body
    if (classList.contains(`theme_${Theme.Light}`)) return LIGHT_PALETTE
    if (classList.contains(`theme_${Theme.Dark}`)) return DARK_PALETTE
    return window.matchMedia?.('(prefers-color-scheme: light)').matches
      ? LIGHT_PALETTE
      : DARK_PALETTE
  } catch {
    return DARK_PALETTE
  }
}
