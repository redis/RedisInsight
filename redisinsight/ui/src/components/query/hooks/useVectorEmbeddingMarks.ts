import { useMemo } from 'react'

import { detectVectorEmbeddings } from 'uiSrc/utils'

import {
  UseVectorEmbeddingMarksProps,
  UseVectorEmbeddingMarksReturn,
} from './useVectorEmbeddingMarks.types'

/**
 * Detects large vector embeddings in the query text and exposes them as marks
 * for the shared query layer. Recomputes whenever the query changes, mirroring
 * the decorations recompute in {@link useQueryDecorations}. Detection is pure
 * text scanning, so a memo (not an editor effect) is enough; the marks are
 * ready for the collapse-rendering layer in both Workbench and Vector Search.
 */
export const useVectorEmbeddingMarks = ({
  query,
}: UseVectorEmbeddingMarksProps): UseVectorEmbeddingMarksReturn => {
  const marks = useMemo(() => detectVectorEmbeddings(query), [query])
  return { marks }
}
