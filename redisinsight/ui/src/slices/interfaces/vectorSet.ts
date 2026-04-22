import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces/app'

export interface VectorSetElement {
  name: RedisResponseBuffer
  vector?: number[]
  vectorTruncated?: boolean
  attributes?: string
}

export interface VectorSetData {
  total: number
  keyName: RedisString
  nextCursor?: string
  /** From API: whether cursor-based pagination is supported for listing elements. */
  isPaginationSupported?: boolean
  elements: VectorSetElement[]
}

export interface GetVectorSetElementsResponse {
  total: number
  keyName: RedisString
  nextCursor?: string
  isPaginationSupported?: boolean
  elementNames: RedisResponseBuffer[]
}

export interface AddVectorSetElementsState {
  loading: boolean
  error: string
}

export interface AddVectorSetElementsData {
  keyName: RedisResponseBuffer
  elements: {
    name: string
    vector: number[]
    attributes?: string
  }[]
}

export interface FetchVectorSetElementsParams {
  key: RedisResponseBuffer
  count?: number
  resetData?: boolean
}

export interface FetchMoreVectorSetElementsParams {
  key: RedisResponseBuffer
  nextCursor: string
  count?: number
}

export interface InitialStateVectorSet {
  loading: boolean
  downloading: boolean
  error: string
  data: VectorSetData
  adding: AddVectorSetElementsState
}
