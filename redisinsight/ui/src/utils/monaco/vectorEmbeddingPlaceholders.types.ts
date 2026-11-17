import { VectorEmbeddingRange } from './vectorEmbeddingUtils.types'

export interface StoredEmbedding {
  value: string
  byteSize: number
}

export interface VectorEmbeddingPlaceholder {
  id: string
  dimensions: number
  /** Undefined when the value is unknown (e.g. a query from another session). */
  byteSize?: number
  range: VectorEmbeddingRange
}
