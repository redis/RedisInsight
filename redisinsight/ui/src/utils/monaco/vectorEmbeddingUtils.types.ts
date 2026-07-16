export enum VectorEmbeddingFormat {
  BinaryString = 'binaryString',
  FloatArray = 'floatArray',
}

export interface VectorEmbeddingRange {
  start: number
  end: number
}

export interface VectorEmbeddingMark {
  range: VectorEmbeddingRange
  format: VectorEmbeddingFormat
  byteSize: number
  dimensions: number
  firstValues: number[]
  lastValues: number[]
  paramName?: string
}
