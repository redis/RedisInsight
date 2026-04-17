import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import { RedisString, VectorSetElement } from 'uiSrc/slices/interfaces'
import { Nullable } from 'uiSrc/utils'

export enum VectorSetColumn {
  Name = 'name',
  Actions = 'actions',
}

export interface ElementDeleteConfig {
  deleting: string
  suffix: string
  total: number
  keyName: RedisString
  closePopover: () => void
  showPopover: (item: string) => void
  handleDeleteElement: (item: RedisString | string) => void
  handleRemoveIconClick: () => void
}

export interface ElementsListConfig {
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
  elementDeleteConfig: ElementDeleteConfig
  onViewElement: (element: VectorSetElement) => void
}

export interface ElementNameCellProps {
  element: VectorSetElement
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
}
