import {
  BrowserColumns,
  KeyTypes,
  KeyValueCompressor,
  KeyValueFormat,
} from 'uiSrc/constants'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { Maybe, Nullable } from 'uiSrc/utils'
import { GetKeyInfoResponse } from 'apiSrc/modules/browser/keys/dto'

export interface Key {
  name: string
  type: KeyTypes
  ttl: number
  size: number
  length: number
}

export enum KeyViewType {
  Browser = 'Browser',
  Tree = 'Tree',
}

export enum SearchMode {
  Pattern = 'Pattern',
  Redisearch = 'Redisearch',
}

export interface KeysStore {
  loading: boolean
  deleting: boolean
  error: string
  search: string
  filter: Nullable<KeyTypes>
  isFiltered: boolean
  isSearched: boolean
  isBrowserFullScreen: boolean
  viewType: KeyViewType
  searchMode: SearchMode
  data: KeysStoreData
  selectedKey: {
    loading: boolean
    refreshing: boolean
    isRefreshDisabled: boolean
    lastRefreshTime: Nullable<number>
    error: string
    data: Nullable<IKeyPropTypes>
    length: Maybe<number>
    viewFormat: KeyValueFormat
    compressor: Nullable<KeyValueCompressor>
  }
  addKey: {
    loading: boolean
    error: string
  }
  searchHistory: {
    data: null | Array<SearchHistoryItem>
    loading: boolean
  }
  shownColumns: BrowserColumns[]
}

export interface SearchHistoryItem {
  id: string
  filter: {
    type: string
    match: string
  }
  mode: string
}

export interface KeysStoreData {
  total: number
  scanned: number
  nextCursor: string
  keys: GetKeyInfoResponse[]
  shardsMeta: Record<
    string,
    {
      cursor: number
      scanned: number
      total: number
      host?: string
      port?: number
    }
  >
  previousResultCount: number
  lastRefreshTime: Nullable<number>
  maxResults?: Nullable<number>
}
