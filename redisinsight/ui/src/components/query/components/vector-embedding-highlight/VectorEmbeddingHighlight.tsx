import React from 'react'
import { createPortal } from 'react-dom'

import { useTranslation } from 'uiSrc/i18n'
import { CopyButton } from 'uiSrc/components/copy-button'
import { useVectorEmbeddingMarks } from '../../hooks/useVectorEmbeddingMarks'
import { useVectorEmbeddingDecorations } from '../../hooks/useVectorEmbeddingDecorations'
import { useVectorEmbeddingCollapse } from '../../hooks/useVectorEmbeddingCollapse'
import { VectorEmbeddingHighlightProps } from './VectorEmbeddingHighlight.types'
import { VectorEmbeddingHighlightStyles } from './VectorEmbeddingHighlight.styles'

/**
 * Detects large vector embeddings in the query, highlights them and collapses
 * each into a compact, clickable placeholder chip the user can toggle to
 * hide/show the full value. Hovering a collapsed chip reveals a copy button,
 * portalled into the Monaco content widget the collapse hook manages, that
 * copies the full embedding. Self-contained so the embedding logic can grow
 * independently of the shared CodeEditor; render it alongside a CodeEditor
 * that shares the same monaco instance.
 */
export const VectorEmbeddingHighlight = ({
  monacoObjects,
  query,
}: VectorEmbeddingHighlightProps) => {
  const { t } = useTranslation()
  const { marks } = useVectorEmbeddingMarks({ query })
  useVectorEmbeddingDecorations({ monacoObjects, marks })
  const { copyWidgetNode, copyValue } = useVectorEmbeddingCollapse({
    monacoObjects,
    query,
  })

  return (
    <>
      <VectorEmbeddingHighlightStyles />
      {copyWidgetNode &&
        copyValue !== null &&
        createPortal(
          <CopyButton
            copy={copyValue}
            aria-label={t('query.editor.vectorEmbedding.copy')}
            data-testid="vector-embedding-copy"
          />,
          copyWidgetNode,
        )}
    </>
  )
}
