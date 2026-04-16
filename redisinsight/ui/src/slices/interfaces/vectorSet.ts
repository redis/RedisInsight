import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces/app'

export interface VectorSetElement {
  name: RedisResponseBuffer
  vector?: number[]
  vectorTruncated?: boolean
  attributes?: string
}

export interface ModifiedVectorSetResponse {
  total: number
  key?: RedisResponseBuffer
  keyName: RedisString
  nextCursor?: string
  /** From API: whether cursor-based pagination is supported for listing elements. */
  isPaginationSupported?: boolean
  elements: VectorSetElement[]
}

export interface InitialStateVectorSet {
  loading: boolean
  downloading: boolean
  error: string
  data: ModifiedVectorSetResponse
}
