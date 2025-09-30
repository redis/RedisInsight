import React from 'react'
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

import { ipcThemeChange } from 'uiSrc/electron/utils'
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

    const storedThemeValue = localStorageService.get(BrowserStorageItem.theme)
    const theme =
      !storedThemeValue || !THEME_NAMES.includes(storedThemeValue)
        ? defaultState.theme
        : storedThemeValue
    const usingSystemTheme = theme === Theme.System

    themeService.applyTheme(theme)

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
          {children}
        </StyledThemeProvider>
      </ThemeContext.Provider>
    )
  }
}

export default ThemeProvider
