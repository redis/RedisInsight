import { BoxSelectionGroupBox } from '@redis-ui/components'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

export interface VectorSearchBox extends BoxSelectionGroupBox {
  text: string
  tag: FieldTypes
}
