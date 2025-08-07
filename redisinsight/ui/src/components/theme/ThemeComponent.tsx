import React, { useContext, useEffect } from 'react'
import { GlobalStyle } from 'uiBase/theme'
import {
  BrowserStorageItem,
  Theme,
  THEME_MATCH_MEDIA_DARK,
} from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

const ThemeComponent = () => {
  const { changeTheme } = useContext(ThemeContext)
  useEffect(() => {
    const handler = (_event: unknown) => {
      const theme = localStorageService.get(BrowserStorageItem.theme)
      if (theme === Theme.System) {
        changeTheme(theme)
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

  return <GlobalStyle />
}

export default ThemeComponent
