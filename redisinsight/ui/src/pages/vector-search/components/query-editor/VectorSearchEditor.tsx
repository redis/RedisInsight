import React from 'react'

import { MonacoLanguage } from 'uiSrc/constants'
import { CodeEditor } from 'uiSrc/components/base/code-editor'
import { useQueryEditorContext, useQueryEditor } from 'uiSrc/components/query'

import { EDITOR_OPTIONS } from './QueryEditor.constants'
import * as S from './QueryEditor.styles'

/**
 * Vector Search editor component.
 * Uses the shared useQueryEditor hook (no DSL syntax, no command history).
 */
export const VectorSearchEditor = () => {
  const { query, onSubmit } = useQueryEditorContext()

  const { editorDidMount, onChange } = useQueryEditor({ onSubmit })

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
