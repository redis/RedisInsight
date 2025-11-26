import React, { useEffect } from 'react'
import {
  BrowserStorageItem,
  Theme,
  THEME_MATCH_MEDIA_DARK,
} from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { useThemeContext } from 'uiSrc/contexts/themeContext'

const ThemeComponent = () => {
  const themeContext = useThemeContext()
  useEffect(() => {
    const handler = () => {
      let theme = localStorageService.get(BrowserStorageItem.theme)
      if (
        themeContext.theme === Theme.System &&
        themeContext.usingSystemTheme
      ) {
        themeContext.changeTheme(theme)
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
