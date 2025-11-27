import React, { useEffect, useRef } from 'react'
import {
  BrowserStorageItem,
  Theme,
  THEME_MATCH_MEDIA_DARK,
} from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { useThemeContext } from 'uiSrc/contexts/themeContext'

const ThemeComponent = () => {
  const themeContext = useThemeContext()
  const themeContextRef = useRef(themeContext)

  // Keep the ref updated with current context values
  themeContextRef.current = themeContext

  useEffect(() => {
    // TODO: do we really need this?
    const handler = () => {
      let theme = localStorageService.get(BrowserStorageItem.theme)
      if (theme === Theme.System && themeContextRef.current.usingSystemTheme) {
        themeContextRef.current.changeTheme(theme)
      }
    }

    window
      .matchMedia(THEME_MATCH_MEDIA_DARK)
      .addEventListener('change', handler)

    return () => {
      window
        .matchMedia(THEME_MATCH_MEDIA_DARK)
        .removeEventListener('change', handler)
    }
  }, [])

  return <></>
}

export default ThemeComponent
