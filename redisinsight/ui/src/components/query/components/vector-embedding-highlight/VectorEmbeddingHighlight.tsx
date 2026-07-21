import React from 'react'

import { useVectorEmbeddingMarks } from '../../hooks/useVectorEmbeddingMarks'
import { useVectorEmbeddingDecorations } from '../../hooks/useVectorEmbeddingDecorations'
import { useVectorEmbeddingCollapse } from '../../hooks/useVectorEmbeddingCollapse'
import { VectorEmbeddingHighlightProps } from './VectorEmbeddingHighlight.types'
import { VectorEmbeddingHighlightStyles } from './VectorEmbeddingHighlight.styles'

/**
 * Detects large vector embeddings in the query, highlights them and collapses
 * each into a compact, clickable placeholder chip the user can toggle to
 * hide/show the full value. Self-contained so the embedding logic can grow
 * independently of the shared CodeEditor; render it alongside a CodeEditor
 * that shares the same monaco instance.
 */
export const VectorEmbeddingHighlight = ({
  monacoObjects,
  query,
}: VectorEmbeddingHighlightProps) => {
  const { marks } = useVectorEmbeddingMarks({ query })
  useVectorEmbeddingDecorations({ monacoObjects, marks })
  useVectorEmbeddingCollapse({ monacoObjects, query })

  return <VectorEmbeddingHighlightStyles />
}
