import { useMemo } from 'react'

import { detectVectorEmbeddings } from 'uiSrc/utils'

import {
  UseVectorEmbeddingMarksProps,
  UseVectorEmbeddingMarksReturn,
} from './useVectorEmbeddingMarks.types'

/**
 * Detects large vector embeddings in the query text and exposes them as marks.
 * Recomputes on query change.
 */
export const useVectorEmbeddingMarks = ({
  query,
}: UseVectorEmbeddingMarksProps): UseVectorEmbeddingMarksReturn => {
  const marks = useMemo(() => detectVectorEmbeddings(query), [query])
  return { marks }
}
