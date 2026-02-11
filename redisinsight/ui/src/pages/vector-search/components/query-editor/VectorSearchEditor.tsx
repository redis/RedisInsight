import React from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { MonacoLanguage } from 'uiSrc/constants'
import { CodeEditor } from 'uiSrc/components/base/code-editor'
import { useQueryEditorContext, useQueryEditor } from 'uiSrc/components/query'
import { UseRedisCompletionsReturn } from 'uiSrc/components/query/hooks/useRedisCompletions.types'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'

import { EDITOR_OPTIONS } from './QueryEditor.constants'
import { getOnboardingSuggestions } from './onboardingSuggestions'
import * as S from './QueryEditor.styles'

/**
 * Shows the onboarding suggestions panel when the editor is empty.
 *
 * Both `setSuggestionsData` and `editor.trigger` happen inside the
 * **same** `setTimeout` callback so that cursor-change handlers
 * (which run synchronously after mount/focus and would overwrite
 * `suggestionsRef` with generic commands) cannot interleave.
 */
const showOnboardingSuggestions = (
  editor: monacoEditor.editor.IStandaloneCodeEditor,
  completions: UseRedisCompletionsReturn,
  indexes: RedisResponseBuffer[],
) => {
  if (editor.getValue()?.trim()) return

  const suggestions = getOnboardingSuggestions(indexes)
  completions.setEscapedSuggestions(false)

  setTimeout(() => {
    // Re-check: editor may have received content in the meantime
    if (editor.getValue()?.trim()) return

    completions.setSuggestionsData(suggestions)
    editor.trigger('', 'editor.action.triggerSuggest', { auto: false })
  })
}

/**
 * Vector Search editor component.
 * Uses the shared useQueryEditor hook (no DSL syntax, no command history).
 *
 * **Onboarding flow** (Vector Search–specific):
 *
 * When the editor is empty and receives focus, a suggestions panel is
 * shown with a predefined list of RQE query templates (FT.SEARCH,
 * FT.AGGREGATE, FT.SUGGET, FT.SPELLCHECK, FT.EXPLAIN, FT.PROFILE,
 * FT._LIST).  Each template shows its description first; full
 * documentation is expandable via the Monaco details panel.
 *
 * Templates are **index-aware**: when available indexes exist, the
 * first index name is pre-filled in snippet placeholders.
 *
 * Once the user picks a template or starts typing, the normal
 * autocomplete behaviour takes over with all Redis commands available.
 */
export const VectorSearchEditor = () => {
  const { query, onSubmit, indexes } = useQueryEditorContext()

  const { editorDidMount, onChange } = useQueryEditor({
    onSubmit,
    onSetup: (editor, _monaco, completions) => {
      // Handle "No indexes" suggestion interaction
      completions.setupSuggestionWidgetListener(editor)

      // Onboarding: show predefined FT.* templates on initial mount
      showOnboardingSuggestions(editor, completions, indexes)

      // Re-show templates when the editor regains focus while still empty
      editor.onDidFocusEditorWidget(() => {
        showOnboardingSuggestions(editor, completions, indexes)
      })
    },
  })

  return (
    <S.EditorContainer data-testid="vector-search-editor">
      <CodeEditor
        language={MonacoLanguage.Redis as string}
        value={query}
        options={EDITOR_OPTIONS}
        className={`${MonacoLanguage.Redis}-editor`}
        onChange={onChange}
        editorDidMount={editorDidMount}
      />
    </S.EditorContainer>
  )
}
