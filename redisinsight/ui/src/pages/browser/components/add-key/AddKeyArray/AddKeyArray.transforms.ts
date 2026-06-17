import { CreateArrayWithExpireDto } from 'apiClient'

import { parseArrayIndex, stringToBuffer } from 'uiSrc/utils'

import { CONTIGUOUS_MODE, SPARSE_MODE } from './constants'
import { IArraySparseElement } from './AddKeyArray.types'

// RedisResponseBuffer and the generated apiClient buffer shape are
// structurally equal at runtime but typed differently, so cast at the boundary.
const toApiBuffer = (value: string) =>
  stringToBuffer(value) as unknown as CreateArrayWithExpireDto['keyName']

export interface ContiguousPayloadInput {
  keyName: string
  startIndex: string
  values: string[]
}

export interface SparsePayloadInput {
  keyName: string
  elements: IArraySparseElement[]
}

export const transformToContiguousMode = ({
  keyName,
  startIndex,
  values,
}: ContiguousPayloadInput): CreateArrayWithExpireDto => ({
  keyName: toApiBuffer(keyName),
  mode: CONTIGUOUS_MODE,
  startIndex: parseArrayIndex(startIndex)!,
  values: values.map((value) => toApiBuffer(value)),
})

export const transformToSparseMode = ({
  keyName,
  elements,
}: SparsePayloadInput): CreateArrayWithExpireDto => ({
  keyName: toApiBuffer(keyName),
  mode: SPARSE_MODE,
  elements: elements.map((item) => ({
    index: parseArrayIndex(item.index)!,
    value: toApiBuffer(item.value),
  })),
})
