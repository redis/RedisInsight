import React, { useEffect, useRef, useState } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { MonacoLanguage } from 'uiSrc/constants'
import { CodeEditor } from 'uiSrc/components/base/code-editor'
import { useQueryEditorContext, useQueryEditor } from 'uiSrc/components/query'
import { UseRedisCompletionsReturn } from 'uiSrc/components/query/hooks/useRedisCompletions.types'

import { EDITOR_OPTIONS, EDITOR_PLACEHOLDER } from './QueryEditor.constants'
import { getOnboardingSuggestions } from './onboardingSuggestions'
import * as S from './QueryEditor.styles'

/**
 * Auto-opens the suggestion widget when the editor is empty.
 *
 * This only **triggers** the widget; the actual FT.* onboarding data
 * is provided by a dedicated completion provider registered in `onSetup`.
 * That provider is independent of `suggestionsRef`, so the templates are
 * always present regardless of whether cursor-change handlers overwrite
 * the main suggestions list.
 */
const triggerEmptySuggestions = (
  editor: monacoEditor.editor.IStandaloneCodeEditor,
  completions: UseRedisCompletionsReturn,
) => {
  if (editor.getValue()?.trim()) return

  completions.setEscapedSuggestions(false)

  setTimeout(() => {
    if (editor.getValue()?.trim()) return
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
  const { query, onSubmit, indexes, activeIndexName } = useQueryEditorContext()
  // Start as true because useMonacoRedisEditor auto-focuses the editor on mount
  const [focused, setFocused] = useState(true)
  const [contentLeft, setContentLeft] = useState(0)
  const disposeOnboardingRef = useRef<(() => void) | null>(null)
  // Keep refs to always read the latest values inside mount-time closures
  const indexesRef = useRef(indexes)
  indexesRef.current = indexes
  const activeIndexNameRef = useRef(activeIndexName)
  activeIndexNameRef.current = activeIndexName
  // Track whether the user has interacted with the editor
  const hasInteractedRef = useRef(false)

  // Dispose the onboarding completion provider on unmount
  useEffect(
    () => () => {
      disposeOnboardingRef.current?.()
    },
    [],
  )

  const { editorDidMount, onChange } = useQueryEditor({
    onSubmit,
    onSetup: (editor, monaco, completions) => {
      // Handle "No indexes" suggestion interaction
      completions.setupSuggestionWidgetListener(editor)

      // Read Monaco's layout so the placeholder aligns with the content area
      setContentLeft(editor.getLayoutInfo().contentLeft)
      editor.onDidLayoutChange((info) => setContentLeft(info.contentLeft))

      // Register an additional completion provider that returns FT.*
      // onboarding templates when the editor is empty.  Monaco merges
      // results from all providers; the templates sort first via sortText.
      disposeOnboardingRef.current?.()
      disposeOnboardingRef.current =
        monaco.languages.registerCompletionItemProvider(
          MonacoLanguage.Redis as string,
          {
            provideCompletionItems: (model) => {
              if (model.getValue().trim()) return { suggestions: [] }
              return {
                suggestions: getOnboardingSuggestions(
                  indexesRef.current,
                  activeIndexNameRef.current,
                ),
              }
            },
          },
        ).dispose

      // Re-open when content is deleted back to empty (only after first interaction)
      editor.onDidChangeModelContent(() => {
        hasInteractedRef.current = true
        if (!editor.getValue()?.trim()) {
          triggerEmptySuggestions(editor, completions)
        }
      })

      // Open suggestions on click when the editor is empty
      editor.onMouseDown(() => {
        if (!hasInteractedRef.current) {
          hasInteractedRef.current = true
          triggerEmptySuggestions(editor, completions)
        }
      })

      // Re-open when the editor regains focus while still empty (only after first interaction)
      editor.onDidFocusEditorWidget(() => {
        setFocused(true)
        if (hasInteractedRef.current) {
          triggerEmptySuggestions(editor, completions)
        }
      })

      editor.onDidBlurEditorWidget(() => {
        setFocused(false)
      })
    },
  })

  return (
    <S.EditorContainer as="div" data-testid="vector-search-editor">
      {!query && !focused && (
        <S.EditorPlaceholder
          as="div"
          $contentLeft={contentLeft}
          data-testid="editor-placeholder"
        >
          {EDITOR_PLACEHOLDER}
        </S.EditorPlaceholder>
      )}
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
