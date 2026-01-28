import React, { useContext } from 'react'
import { ThemeProvider as StyledThemeProvider } from 'styled-components'

import { ipcThemeChange } from 'uiSrc/electron/utils/ipcThemeChange'
import { CommonStyles, themeLight, themeDark } from 'uiSrc/styles/theme'
import { GlobalStyles } from 'uiSrc/styles/globalStyles'
import {
  BrowserStorageItem,
  Theme,
  THEMES,
  THEME_MATCH_MEDIA_DARK,
  DEFAULT_THEME,
} from '../constants'
import { localStorageService, themeService } from '../services'

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

export const isValidTheme = (theme: unknown): theme is Theme => {
  return typeof theme === 'string' && THEME_NAMES.includes(theme as Theme)
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
    } else if (storedThemeValue && isValidTheme(storedThemeValue)) {
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
    const uiTheme = theme === Theme.Dark ? themeDark : themeLight
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
  return useContext(ThemeContext)
}

export default ThemeProvider
