import { monaco as monacoEditor } from 'react-monaco-editor'

import { IMonacoQuery, Nullable } from 'uiSrc/utils'
import { UseRedisCompletionsReturn } from './useRedisCompletions.types'

export interface UseQueryEditorOptions {
  /** Called when the user submits the query (Ctrl+Enter). */
  onSubmit: (value?: string) => void

  /**
   * Called during editor setup after base setup completes.
   * Use to register additional commands, listeners, or expose the editor ref.
   */
  onSetup?: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
    completions: UseRedisCompletionsReturn,
  ) => void

  /**
   * Returns whether a dedicated editor is currently open.
   * When true, cursor change handling is suppressed (suggestions skipped).
   */
  isDedicatedEditorOpen?: () => boolean

  /**
   * Additional key handler, called after base key handling.
   * Base handling covers: parameter hints, snippet exit, escape suggestions.
   */
  onKeyDown?: (
    e: monacoEditor.IKeyboardEvent,
    helpers: {
      completions: UseRedisCompletionsReturn
      onExitSnippetMode: () => void
    },
  ) => void

  /**
   * Additional cursor change handler, called after base cursor handling.
   * Receives the cursor event and the resolved command (if any).
   */
  onCursorChange?: (
    e: monacoEditor.editor.ICursorPositionChangedEvent,
    command: Nullable<IMonacoQuery>,
  ) => void

  /** Called on onChange after setQuery. */
  onQueryChange?: (value: string) => void

  /** Additional cleanup on unmount. */
  onCleanup?: () => void

  /**
   * Guard for parameter hints.
   * When provided and returns false, parameter hints are suppressed.
   * Default: always trigger.
   */
  shouldTriggerParameterHints?: () => boolean
}

export interface UseQueryEditorReturn {
  editorDidMount: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) => void
  onChange: (value?: string) => void
  completions: UseRedisCompletionsReturn
  onExitSnippetMode: () => void
  triggerUpdateCursorPosition: (
    editor: monacoEditor.editor.IStandaloneCodeEditor,
  ) => void
}
