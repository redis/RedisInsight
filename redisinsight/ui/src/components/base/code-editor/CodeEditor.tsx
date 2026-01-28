import React, { useContext } from 'react'
import ReactMonacoEditor from 'react-monaco-editor'

import { Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'

import { CodeEditorProps } from './CodeEditor.types'

/**
 * Thin wrapper around Monaco editor.
 * Provides an abstraction point for potential future editor changes.
 * Automatically handles theme from context.
 */
export const CodeEditor = (props: CodeEditorProps) => {
  const { theme } = useContext(ThemeContext)
  const monacoTheme = props.theme ?? (theme === Theme.Dark ? 'dark' : 'light')

  return <ReactMonacoEditor {...props} theme={monacoTheme} />
}
