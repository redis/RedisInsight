import { VectorEmbeddingMark } from 'uiSrc/utils'

export interface UseVectorEmbeddingMarksProps {
  /** Current editor content to scan for embeddings. */
  query: string
}

export interface UseVectorEmbeddingMarksReturn {
  /** All large vector embeddings detected in the query, ordered by position. */
  marks: VectorEmbeddingMark[]
}
