import { KeyValueCompressor, KeyValueFormat } from 'uiSrc/constants'
import {
  RedisResponseBuffer,
  RedisString,
  VectorSetElement,
} from 'uiSrc/slices/interfaces'
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

/** Action target shape — both `VectorSetElement` and `VectorSetSimilarityMatch` satisfy this. */
export interface VectorSetActionTarget {
  name: RedisResponseBuffer
}

/**
 * Shared by `VectorSetElementList` and `SimilaritySearchResultsTable` so a
 * single delete-state + handlers can drive both rows-actions columns.
 */
export interface VectorSetActionsConfig {
  elementDeleteConfig: ElementDeleteConfig
  onViewElement: (element: VectorSetActionTarget) => void
  onSearchByElement: (element: VectorSetActionTarget) => void
}

export interface ElementsListConfig {
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
  actionsConfig: VectorSetActionsConfig
}

export interface ElementNameCellProps {
  element: VectorSetElement
  compressor: Nullable<KeyValueCompressor>
  viewFormat: KeyValueFormat
}
