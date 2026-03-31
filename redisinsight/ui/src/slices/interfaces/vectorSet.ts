import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces/app'

export interface VectorSetElement {
  name: RedisResponseBuffer
  vector?: number[]
  attributes?: string
}

export interface ModifiedVectorSetResponse {
  total: number
  key?: RedisResponseBuffer
  keyName: RedisString
  nextCursor?: string
  elements: VectorSetElement[]
}

export interface InitialStateVectorSet {
  loading: boolean
  error: string
  data: ModifiedVectorSetResponse
}
