import React from 'react'

import { useVectorEmbeddingMarks } from '../../hooks/useVectorEmbeddingMarks'
import { useVectorEmbeddingDecorations } from '../../hooks/useVectorEmbeddingDecorations'
import { VectorEmbeddingHighlightStyles } from './VectorEmbeddingHighlight.styles'
import { VectorEmbeddingHighlightProps } from './VectorEmbeddingHighlight.types'

/**
 * Detects large vector embeddings in the query and highlights them in the
 * editor. Self-contained so the embedding logic can grow independently of the
 * shared CodeEditor; render it alongside a CodeEditor that shares the same
 * monaco instance.
 */
export const VectorEmbeddingHighlight = ({
  monacoObjects,
  query,
}: VectorEmbeddingHighlightProps) => {
  const { marks } = useVectorEmbeddingMarks({ query })
  useVectorEmbeddingDecorations({ monacoObjects, marks })

  return <VectorEmbeddingHighlightStyles />
}
