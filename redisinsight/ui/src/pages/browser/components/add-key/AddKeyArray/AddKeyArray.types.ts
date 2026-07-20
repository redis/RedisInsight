import { Maybe } from 'uiSrc/utils'

import type { PopulateMode } from './constants'

export interface PopulateOption {
  value: PopulateMode
  label: string
  description?: string
  disabled?: boolean
  id: string
}

export interface IArraySparseElement {
  id: number
  index: string
  value: string
}

export const INITIAL_SPARSE_ELEMENT: IArraySparseElement = {
  id: 0,
  index: '',
  value: '',
}

export interface ContiguousValue {
  startIndex: string
  values: string[]
}

export interface SparseValue {
  elements: IArraySparseElement[]
}

export interface Props {
  keyName: string
  keyTTL: Maybe<number>
  onCancel: (isCancelled?: boolean) => void
  setKeyName?: (value: string) => void
  setKeyNameDisabled?: (disabled: boolean) => void
}
