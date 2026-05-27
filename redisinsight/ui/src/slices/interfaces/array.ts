import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces/app'

export interface ArrayElement {
  index: number
  value: RedisResponseBuffer
}

export interface ArrayData {
  total: number
  logicalLength: number
  keyName: RedisString
  nextCursor?: number
  elements: ArrayElement[]
}

export type GetArrayElementsResponse = ArrayData

export interface AddArrayElementsState {
  loading: boolean
  error: string
}

export interface InitialStateArray {
  loading: boolean
  error: string
  data: ArrayData
  adding: AddArrayElementsState
}

export interface AddArrayElementsData {
  keyName: RedisResponseBuffer
  elements: {
    index: number
    value: string
  }[]
}

export interface CreateArrayWithExpireDto {
  keyName: RedisResponseBuffer
  elements: {
    index: number
    value: RedisResponseBuffer
  }[]
  expire?: number
}

export interface FetchArrayElementsParams {
  key: RedisResponseBuffer
  count?: number
  resetData?: boolean
}

export interface FetchMoreArrayElementsParams {
  key: RedisResponseBuffer
  cursor: number
  count?: number
}
