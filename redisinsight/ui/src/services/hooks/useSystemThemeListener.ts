import { useEffect } from 'react'
import { Theme, THEME_MATCH_MEDIA_DARK } from 'uiSrc/constants'
import { useThemeContext } from 'uiSrc/contexts/themeContext'

/**
 * Hook that listens to OS system theme changes
 * and updates the theme context when user has System theme selected.
 */
export const useSystemThemeListener = () => {
  const { usingSystemTheme, changeTheme } = useThemeContext()

  useEffect(() => {
    const handleSystemThemeChange = () => {
      changeTheme(Theme.System)
    }
    const mediaQuery = window.matchMedia?.(THEME_MATCH_MEDIA_DARK)
    if (usingSystemTheme && mediaQuery) {
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    }

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [usingSystemTheme, changeTheme])
}
