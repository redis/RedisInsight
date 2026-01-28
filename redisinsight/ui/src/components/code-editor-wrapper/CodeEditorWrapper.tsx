import React, { useContext } from 'react'
import ReactMonacoEditor from 'react-monaco-editor'

import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import { CodeEditorWrapperProps } from './CodeEditorWrapper.types'

/**
 * Thin wrapper around Monaco editor.
 * Provides an abstraction point for potential future editor changes.
 */
export const CodeEditorWrapper = (props: CodeEditorWrapperProps) => {
  const { theme: themeOverride, ...rest } = props
  const { theme: defaultTheme } = useContext(ThemeContext)

  const monacoTheme =
    themeOverride ?? (defaultTheme === Theme.Dark ? 'dark' : 'light')

  return <ReactMonacoEditor {...rest} theme={monacoTheme} />
}
