import React, { useEffect } from 'react'
import MonacoEditor, { monaco as monacoEditor } from 'react-monaco-editor'

import { MonacoLanguage } from 'uiSrc/constants'
import {
  useQueryEditorContext,
  useMonacoRedisEditor,
  useRedisCompletions,
  useQueryDecorations,
} from 'uiSrc/components/query'

import { EDITOR_OPTIONS } from './QueryEditor.constants'
import * as S from './QueryEditor.styles'

/**
 * Vector Search editor component.
 * Uses a subset of the hooks (no DSL syntax, no command history).
 */
export const VectorSearchEditor = () => {
  const { monacoObjects, query, setQuery, commands, indexes, onSubmit } =
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

    // Cursor change handler for suggestions
    editor.onDidChangeCursorPosition(
      (e: monacoEditor.editor.ICursorPositionChangedEvent) => {
        completions.handleCursorChange(e)
      },
    )

    // Key handler for parameter hints and snippet mode exit
    editor.onKeyDown((e: monacoEditor.IKeyboardEvent) => {
      if (
        e.keyCode === monacoEditor.KeyCode.Tab ||
        e.keyCode === monacoEditor.KeyCode.Enter ||
        (e.keyCode === monacoEditor.KeyCode.Space && e.ctrlKey && e.shiftKey) ||
        (e.keyCode === monacoEditor.KeyCode.Space && !e.ctrlKey && !e.shiftKey)
      ) {
        completions.onTriggerParameterHints()
      }

      // Workaround for Monaco issue #2756: exit snippet mode on Enter/Space
      if (
        e.keyCode === monacoEditor.KeyCode.Enter ||
        e.keyCode === monacoEditor.KeyCode.Space
      ) {
        onExitSnippetMode()
      }
    })

    // Initial suggestions
    completions.setSuggestionsData(completions.getSuggestions(editor).data)
  }

  // Core editor lifecycle
  const {
    monacoTheme,
    editorDidMount: baseEditorDidMount,
    onExitSnippetMode,
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
    },
    [],
  )

  const onChange = (value: string = '') => {
    setQuery(value)
  }

  return (
    <S.EditorContainer data-testid="vector-search-editor">
      <MonacoEditor
        language={MonacoLanguage.Redis as string}
        theme={monacoTheme}
        value={query}
        options={EDITOR_OPTIONS}
        className={`${MonacoLanguage.Redis}-editor`}
        onChange={onChange}
        editorDidMount={baseEditorDidMount}
      />
    </S.EditorContainer>
  )
}
