import { useEffect } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { useQueryEditorContext } from '../context/query-editor.context'
import { useRedisCompletions } from './useRedisCompletions'
import { useMonacoRedisEditor } from './useMonacoRedisEditor'
import { useQueryDecorations } from './useQueryDecorations'
import {
  UseQueryEditorOptions,
  UseQueryEditorReturn,
} from './useQueryEditor.types'

/**
 * Shared editor lifecycle hook that composes useRedisCompletions,
 * useMonacoRedisEditor, and useQueryDecorations.
 *
 * Handles the common editor setup: language providers, key handlers
 * (parameter hints, snippet exit, escape suggestions), cursor change,
 * initial suggestions, decorations, and cleanup.
 *
 * Consumers can extend behaviour via optional callbacks (onSetup,
 * onKeyDown, onCursorChange, onQueryChange, onCleanup,
 * shouldTriggerParameterHints).
 */
export const useQueryEditor = (
  options: UseQueryEditorOptions,
): UseQueryEditorReturn => {
  const {
    onSubmit,
    onSetup,
    onKeyDown,
    onCursorChange,
    onQueryChange,
    onCleanup,
    shouldTriggerParameterHints,
    isDedicatedEditorOpen,
  } = options

  const { monacoObjects, query, setQuery, commands, indexes } =
    useQueryEditorContext()

  // Autocomplete & suggestions
  const completions = useRedisCompletions({
    monacoObjects,
    commands,
    indexes,
  })

  function handleEditorSetup(
    editor: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: typeof monacoEditor,
  ) {
    // Register language providers
    completions.setupProviders(monaco)

    // Base key handler
    editor.onKeyDown((e: monacoEditor.IKeyboardEvent) => {
      // Trigger parameter hints on Tab / Enter / Space / Ctrl+Shift+Space
      if (
        e.keyCode === monacoEditor.KeyCode.Tab ||
        e.keyCode === monacoEditor.KeyCode.Enter ||
        (e.keyCode === monacoEditor.KeyCode.Space && e.ctrlKey && e.shiftKey) ||
        (e.keyCode === monacoEditor.KeyCode.Space && !e.ctrlKey && !e.shiftKey)
      ) {
        const canTrigger = shouldTriggerParameterHints
          ? shouldTriggerParameterHints()
          : true
        if (canTrigger) {
          completions.onTriggerParameterHints()
        }
      }

      // Workaround for Monaco issue #2756: exit snippet mode on Enter/Space
      if (
        e.keyCode === monacoEditor.KeyCode.Enter ||
        e.keyCode === monacoEditor.KeyCode.Space
      ) {
        onExitSnippetMode()
      }

      // Dismiss suggestions on Escape so they don't reappear on next cursor change
      if (
        e.keyCode === monacoEditor.KeyCode.Escape &&
        completions.isSuggestionsOpened()
      ) {
        completions.setEscapedSuggestions(true)
      }

      // Consumer-specific key handling
      onKeyDown?.(e, { completions, onExitSnippetMode })
    })

    // Base cursor change handler
    editor.onDidChangeCursorPosition(
      (e: monacoEditor.editor.ICursorPositionChangedEvent) => {
        const command = completions.handleCursorChange(
          e,
          isDedicatedEditorOpen?.() ?? false,
        )
        onCursorChange?.(e, command)
      },
    )

    // Initial suggestions
    completions.setSuggestionsData(completions.getSuggestions(editor).data)

    // Consumer-specific setup
    onSetup?.(editor, monaco, completions)
  }

  // Core editor lifecycle
  const {
    editorDidMount: baseEditorDidMount,
    onExitSnippetMode,
    triggerUpdateCursorPosition,
  } = useMonacoRedisEditor({
    monacoObjects,
    onSubmit,
    onSetup: handleEditorSetup,
  })

  // Decorations
  useQueryDecorations({ monacoObjects, query })

  // Cleanup on unmount
  useEffect(
    () => () => {
      completions.disposeProviders()
      onCleanup?.()
    },
    [],
  )

  const onChange = (value: string = '') => {
    setQuery(value)
    onQueryChange?.(value)
  }

  return {
    editorDidMount: baseEditorDidMount,
    onChange,
    completions,
    onExitSnippetMode,
    triggerUpdateCursorPosition,
  }
}
