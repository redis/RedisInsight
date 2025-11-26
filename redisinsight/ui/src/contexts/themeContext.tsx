import React, { useContext } from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'
import {
  theme as redisUiOldTheme,
  CommonStyles,
  themeLight,
  themeDark,
} from '@redis-ui/styles'
import 'modern-normalize/modern-normalize.css'
import '@redis-ui/styles/normalized-styles.css'
import '@redis-ui/styles/fonts.css'

import { ipcThemeChange } from 'uiSrc/electron/utils/ipcThemeChange'
import {
  BrowserStorageItem,
  Theme,
  THEMES,
  THEME_MATCH_MEDIA_DARK,
  DEFAULT_THEME,
} from '../constants'
import { localStorageService, themeService } from '../services'
import { GlobalStyles } from 'uiSrc/styles/globalStyles'

interface Props {
  children: React.ReactNode
}

const THEME_NAMES = THEMES.map(({ value }) => value)

const getQueryTheme = () => {
  const queryThemeParam = new URLSearchParams(window.location.search)
    .get('theme')
    ?.toUpperCase()

  return THEMES.find(({ value }) => value === queryThemeParam)?.value
}

export const defaultState = {
  theme: DEFAULT_THEME || Theme.System,
  usingSystemTheme:
    localStorageService.get(BrowserStorageItem.theme) === Theme.System,
  changeTheme: (themeValue: any) => {
    themeService.applyTheme(themeValue)
  },
}

export const ThemeContext = React.createContext(defaultState)

export class ThemeProvider extends React.Component<Props> {
  constructor(props: any) {
    super(props)

    const queryTheme = getQueryTheme()
    const storedThemeValue = localStorageService.get(BrowserStorageItem.theme)

    let theme = defaultState.theme

    if (queryTheme) {
      theme = queryTheme
    } else if (storedThemeValue && THEME_NAMES.includes(storedThemeValue)) {
      theme = storedThemeValue
    }

    const usingSystemTheme = theme === Theme.System

    themeService.applyTheme(theme as Theme)

    this.state = {
      theme: theme === Theme.System ? this.getSystemTheme() : theme,
      usingSystemTheme,
    }
  }

  getSystemTheme = () =>
    window.matchMedia?.(THEME_MATCH_MEDIA_DARK)?.matches
      ? Theme.Dark
      : Theme.Light

  changeTheme = async (themeValue: any) => {
    let actualTheme = themeValue

    // since change theme is async need to wait to have a proper prefers-color-scheme
    await ipcThemeChange(themeValue)

    if (themeValue === Theme.System) {
      actualTheme = this.getSystemTheme()
    }

    this.setState(
      { theme: actualTheme, usingSystemTheme: themeValue === Theme.System },
      () => {
        themeService.applyTheme(themeValue)
      },
    )
  }

  render() {
    const { children } = this.props
    const { theme, usingSystemTheme }: any = this.state
    const uiTheme =
      theme === Theme.Dark
        ? themeDark
        : theme === Theme.Light
          ? themeLight
          : redisUiOldTheme
    return (
      <ThemeContext.Provider
        value={{
          theme,
          usingSystemTheme,
          changeTheme: this.changeTheme,
        }}
      >
        <StyledThemeProvider theme={uiTheme}>
          <CommonStyles />
          <GlobalStyles />
          {children}
        </StyledThemeProvider>
      </ThemeContext.Provider>
    )
  }
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

export default ThemeProvider
