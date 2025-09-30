import React, { useLayoutEffect, useState } from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import { CommonStyles, themeLight, themeDark } from '@redis-ui/styles'
import 'modern-normalize/modern-normalize.css'
import '@redis-ui/styles/normalized-styles.css'
import '@redis-ui/styles/fonts.css'

interface Props {
  children: React.ReactNode
}

export const defaultState = {
  theme: themeLight,
}

export const PluginsThemeContext = React.createContext(defaultState)

export const ThemeProvider = ({ children }: Props) => {
  const [theme, setTheme] = useState(defaultState.theme)
  // use useEffect to get body class, if it is equal to 'theme_DARK', set theme to
  // themeDark, if it is equal to 'theme_LIGHT', set theme to themeLight
  useLayoutEffect(() => {
    const bodyClass = document.body.classList.value
    if (bodyClass === 'theme_DARK' && theme !== themeDark) {
      setTheme(themeDark)
    } else if (bodyClass === 'theme_LIGHT' && theme !== themeLight) {
      setTheme(themeLight)
    }
  }, [theme])
  return (
    <PluginsThemeContext.Provider value={{ theme }}>
      <StyledThemeProvider theme={theme}>
        <CommonStyles />
        {children}
      </StyledThemeProvider>
    </PluginsThemeContext.Provider>
  )
}
