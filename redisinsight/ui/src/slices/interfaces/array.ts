import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces/app'

export interface ArrayElement {
  index: string
  value: RedisResponseBuffer
}

export interface ArrayData {
  total: number
  key?: RedisString
  keyName: RedisString
  logicalLength?: string
  nextIndex?: string
  isPaginationSupported?: boolean
  elements: ArrayElement[]
  searchedIndex: string | null
  match: string
}

export interface GetArrayElementsResponse {
  total: number
  keyName: RedisString
  logicalLength?: string
  nextIndex?: string
  isPaginationSupported?: boolean
  elements: ArrayElement[]
}

export interface AddArrayElementsData {
  keyName: RedisResponseBuffer
  elements: {
    index: string
    value: string
  }[]
}

export interface StateArray {
  loading: boolean
  error: string
  data: ArrayData
  updateValue: {
    loading: boolean
    error: string
  }
  adding: {
    loading: boolean
    error: string
  }
}
