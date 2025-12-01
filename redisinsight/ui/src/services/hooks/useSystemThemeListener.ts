import { useCallback, useEffect } from 'react'
import { Theme, THEME_MATCH_MEDIA_DARK } from 'uiSrc/constants'
import { useThemeContext } from 'uiSrc/contexts/themeContext'

let mediaQuery = window.matchMedia?.(THEME_MATCH_MEDIA_DARK)

/**
 * Hook that listens to OS system theme changes
 * and updates the theme context when user has System theme selected.
 */
export const useSystemThemeListener = () => {
  const { usingSystemTheme, changeTheme } = useThemeContext()

  const handleSystemThemeChange = useCallback(() => {
    usingSystemTheme && changeTheme(Theme.System)
  }, [changeTheme, usingSystemTheme])

  useEffect(() => {
    if (!mediaQuery) {
      // Initialize mediaQuery if not done already because window might not be defined when module is loaded
      mediaQuery = window.matchMedia?.(THEME_MATCH_MEDIA_DARK)
    }
    // Only listen if using system theme
    if (usingSystemTheme) {
      if (!mediaQuery) {
        return undefined
      }
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    }
    return () => {
      if (mediaQuery) {
        mediaQuery.removeEventListener('change', handleSystemThemeChange)
      }
    }
  }, [usingSystemTheme])
}
