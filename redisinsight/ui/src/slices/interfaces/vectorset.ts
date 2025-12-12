import { RedisResponseBuffer } from 'uiSrc/slices/interfaces/app'

export interface VectorSetElement {
  name: RedisResponseBuffer
  vector?: number[]
  attributes?: Record<string, unknown>
}

export interface VectorSetSearchResult extends VectorSetElement {
  score: number
}

export interface VectorSetInfo {
  size: number
  vectorDim: number
  quantType: string
  maxLevel?: number
  vsetUid?: number
  hnswMaxNodeUid?: number
}

export interface StateVectorSetData {
  total: number
  key?: RedisResponseBuffer
  keyName: string
  elements: VectorSetElement[]
  nextCursor: string
  info: VectorSetInfo | null
}

export interface StateVectorSet {
  loading: boolean
  searching: boolean
  error: string
  data: StateVectorSetData
  search: {
    loading: boolean
    error: string
    results: VectorSetSearchResult[]
    query: number[] | null
  }
  addElement: {
    loading: boolean
    error: string
  }
  updateAttributes: {
    loading: boolean
    error: string
  }
}
