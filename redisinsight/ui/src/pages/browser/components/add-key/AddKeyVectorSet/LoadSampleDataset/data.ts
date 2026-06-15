import { Vec2WordInfoRow, Vec2WordPreviewRow } from './LoadSampleDataset.types'

export const VEC2WORD_COLLECTION_NAME = 'vec2word'

export const VEC2WORD_PREVIEW: Vec2WordPreviewRow[] = [
  { word: 'king', vector: '[0.012, -0.045, 0.083, …]' },
  { word: 'queen', vector: '[0.034, 0.067, -0.021, …]' },
  { word: 'apple', vector: '[-0.011, 0.054, 0.092, …]' },
]

export const VEC2WORD_INFO: Vec2WordInfoRow[] = [
  { label: 'Dataset', value: VEC2WORD_COLLECTION_NAME },
  { label: 'Size', value: '100' },
  { label: 'Vector size', value: '300' },
  { label: 'Embedding', value: 'GloVe' },
]
