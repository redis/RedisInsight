import { MonacoEditorProps } from 'react-monaco-editor'

/**
 * CodeEditor props - extends Monaco's MonacoEditorProps.
 * This is the abstraction point: add custom props here if needed.
 */
export interface CodeEditorProps extends MonacoEditorProps {
  /**
   * Monaco editor theme. If not provided, automatically derived from ThemeContext.
   * Pass explicitly to override the context-based theme.
   */
  theme?: string | null
}
