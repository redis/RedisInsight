import { Nullable } from 'uiSrc/utils'
import { RedisResponseBuffer } from './app'
import { KeysStoreData, SearchHistoryItem } from './keys'

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
}
