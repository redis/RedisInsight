import React from 'react'
import ReactMonacoEditor from 'react-monaco-editor'

import { CodeEditorWrapperProps } from './CodeEditorWrapper.types'

/**
 * Thin wrapper around Monaco editor.
 * Provides an abstraction point for potential future editor changes.
 */
export const CodeEditorWrapper = (props: CodeEditorWrapperProps) => (
  <ReactMonacoEditor {...props} />
)
