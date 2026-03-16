import { KeyTypes } from 'uiSrc/constants'
import { RedisearchIndexKeyType } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

export const KEY_TYPE_MAP: Partial<Record<KeyTypes, RedisearchIndexKeyType>> = {
  [KeyTypes.Hash]: RedisearchIndexKeyType.HASH,
  [KeyTypes.ReJSON]: RedisearchIndexKeyType.JSON,
}

export const REVERSE_KEY_TYPE_MAP: Record<RedisearchIndexKeyType, KeyTypes> = {
  [RedisearchIndexKeyType.HASH]: KeyTypes.Hash,
  [RedisearchIndexKeyType.JSON]: KeyTypes.ReJSON,
}
