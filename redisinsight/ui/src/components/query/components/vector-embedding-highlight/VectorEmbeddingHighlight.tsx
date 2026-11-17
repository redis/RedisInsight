import React from 'react'

import { useVectorEmbeddingMarks } from '../../hooks/useVectorEmbeddingMarks'
import { useVectorEmbeddingDecorations } from '../../hooks/useVectorEmbeddingDecorations'
import { useVectorEmbeddingCollapse } from '../../hooks/useVectorEmbeddingCollapse'
import { VectorEmbeddingHighlightProps } from './VectorEmbeddingHighlight.types'
import { VectorEmbeddingHighlightStyles } from './VectorEmbeddingHighlight.styles'

/**
 * Highlights and collapses detected vector embeddings. Render alongside a
 * CodeEditor that shares the same monaco instance.
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
