import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { SampleDatasetConfig } from './types'

export const BIKES_DATASET: SampleDatasetConfig = {
  displayName: 'E-commerce discovery',
  indexName: 'idx:bikes_vss',
  indexPrefix: 'bikes:',
  collectionName: 'bikes',
  fields: [
    { id: 'model', name: 'model', value: 'Varuna', type: FieldTypes.TEXT },
    { id: 'brand', name: 'brand', value: 'Eva', type: FieldTypes.TEXT },
    { id: 'price', name: 'price', value: 1398, type: FieldTypes.NUMERIC },
    { id: 'type', name: 'type', value: 'Road bikes', type: FieldTypes.TAG },
    {
      id: 'material',
      name: 'material',
      value: 'aluminium',
      type: FieldTypes.TAG,
    },
    { id: 'weight', name: 'weight', value: 7.5, type: FieldTypes.NUMERIC },
    {
      id: 'description_embeddings',
      name: 'description_embeddings',
      value: 'FLAT, FLOAT32, 768, L2',
      type: FieldTypes.VECTOR,
    },
  ],
}
