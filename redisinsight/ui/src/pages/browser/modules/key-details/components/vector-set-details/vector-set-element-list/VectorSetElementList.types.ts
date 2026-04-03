import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { VectorSetElement } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'

export enum VectorSetColumn {
  Name = 'name',
  Actions = 'actions',
}

export interface GetColumnsOptions {
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
}

export interface ElementNameCellProps {
  element: VectorSetElement
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
}
