import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { SampleDatasetConfig } from './types'

export const MOVIES_DATASET: SampleDatasetConfig = {
  displayName: 'Content recommendations',
  indexName: 'idx:movies_vss',
  indexPrefix: 'movie:',
  collectionName: 'movies',
  fields: [
    { id: 'title', name: 'title', value: 'Toy Story', type: FieldTypes.TEXT },
    {
      id: 'genres',
      name: 'genres',
      value: 'Animation, Comedy, Family',
      type: FieldTypes.TAG,
    },
    {
      id: 'plot',
      name: 'plot',
      value: 'Toys come to life when humans arent around.',
      type: FieldTypes.TEXT,
    },
    { id: 'year', name: 'year', value: 1995, type: FieldTypes.NUMERIC },
    {
      id: 'embedding',
      name: 'embedding',
      value: 'FLAT, FLOAT32, 8, COSINE',
      type: FieldTypes.VECTOR,
    },
  ],
}
