import { Nullable } from 'uiSrc/utils'
import { RedisResponseBuffer } from './app'
import { KeysStoreData, SearchHistoryItem } from './keys'

export interface IndexSummary {
  name: string
  prefixes: string[]
  keyType: string
}

export interface KeyIndexesResponseItem {
  name: string
  prefixes: string[]
  key_type: string
}

export interface KeyIndexesApiResponse {
  indexes: KeyIndexesResponseItem[]
}

export interface KeyIndexesEntry {
  loading: boolean
  data: IndexSummary[]
  error: string
}

export interface StateRedisearch {
  loading: boolean
  error: string
  search: string
  isSearched: boolean
  data: KeysStoreData
  selectedIndex: Nullable<RedisResponseBuffer>
  list: {
    loading: boolean | undefined
    error: string
    data: RedisResponseBuffer[]
  }
  createIndex: {
    loading: boolean
    error: string
  }
  searchHistory: {
    data: null | Array<SearchHistoryItem>
    loading: boolean
  }
  keyIndexes: Record<string, KeyIndexesEntry>
}
