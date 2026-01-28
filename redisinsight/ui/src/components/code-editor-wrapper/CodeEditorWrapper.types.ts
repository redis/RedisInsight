import { MonacoEditorProps } from 'react-monaco-editor'

/**
 * CodeEditorWrapper props - extends Monaco's MonacoEditorProps.
 * This is the abstraction point: add custom props here if needed.
 */
export interface CodeEditorWrapperProps extends MonacoEditorProps {
  // Currently passes through all Monaco props unchanged.
  // Add custom props or overrides here when needed.
}