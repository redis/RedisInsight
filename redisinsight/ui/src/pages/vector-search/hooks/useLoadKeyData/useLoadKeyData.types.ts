import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import { IndexField } from '../../components/index-details/IndexDetails.types'

export interface InferredFieldsResult {
  fields: IndexField[]
  skippedFields: string[]
}

export interface UseLoadKeyDataResult {
  loadKeyData: (
    key: RedisResponseBuffer,
    keyType: RedisearchIndexKeyType,
  ) => void
  fields: IndexField[]
  skippedFields: string[]
  loading: boolean
  error: string | null
}
