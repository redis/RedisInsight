import React from 'react'
import { useTheme } from '@redis-ui/styles'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import { Theme } from 'uiSrc/constants'

/**
 * Bridges the styled-components theme (managed by Storybook's addon-themes)
 * to the app's ThemeContext, so that all consumers (MonacoLanguages, CodeEditor,
 * Config, etc.) receive the correct theme when switching in Storybook.
 */
export const ThemeContextBridge = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const scTheme = useTheme()
  const theme = scTheme.mode === 'dark' ? Theme.Dark : Theme.Light

  return (
    <ThemeContext.Provider
      value={{
        theme,
        usingSystemTheme: false,
        changeTheme: () => {},
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
