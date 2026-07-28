import { TFunction } from 'i18next'
import { Vec2WordInfoRow, Vec2WordPreviewRow } from './LoadSampleDataset.types'

export const VEC2WORD_COLLECTION_NAME = 'vec2word'

export const VEC2WORD_PREVIEW: Vec2WordPreviewRow[] = [
  { word: 'king', vector: '[0.012, -0.045, 0.083, …]' },
  { word: 'queen', vector: '[0.034, 0.067, -0.021, …]' },
  { word: 'apple', vector: '[-0.011, 0.054, 0.092, …]' },
]

export const getVec2WordInfo = (t: TFunction): Vec2WordInfoRow[] => [
  {
    testId: 'dataset',
    label: t('browser.addKey.vectorSet.sample.dataset'),
    value: VEC2WORD_COLLECTION_NAME,
  },
  {
    testId: 'size',
    label: t('browser.addKey.vectorSet.sample.size'),
    value: '100',
  },
  {
    testId: 'vector-size',
    label: t('browser.addKey.vectorSet.sample.vectorSize'),
    value: '300',
  },
  {
    testId: 'embedding',
    label: t('browser.addKey.vectorSet.sample.embedding'),
    value: 'GloVe',
  },
]
