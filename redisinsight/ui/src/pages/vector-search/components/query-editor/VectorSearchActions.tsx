import React from 'react'

import RunButton from 'uiSrc/components/query/components/RunButton'
import { useQueryEditorContext } from 'uiSrc/components/query'

import * as S from './QueryEditor.styles'

/**
 * Actions bar for Vector Search editor.
 * Contains only a Run button.
 */
export const VectorSearchActions = () => {
  const { isLoading, onSubmit } = useQueryEditorContext()

  return (
    <S.ActionsBar data-testid="vector-search-actions">
      <RunButton
        isLoading={isLoading}
        onSubmit={() => onSubmit()}
      />
    </S.ActionsBar>
  )
}
