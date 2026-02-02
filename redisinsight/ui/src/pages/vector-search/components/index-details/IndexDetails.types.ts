import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { RowSelectionState } from 'uiSrc/components/base/layout/table'

export type IndexFieldValue = string | number

export interface IndexField {
  id: string
  name: string
  value: IndexFieldValue
  type: FieldTypes
}

export enum IndexDetailsMode {
  Readonly = 'readonly',
  Editable = 'editable',
}

export enum IndexDetailsColumn {
  Selection = 'selection',
  Name = 'name',
  Value = 'value',
  Type = 'type',
  Actions = 'actions',
}

export interface IndexDetailsProps {
  fields: IndexField[]
  mode?: IndexDetailsMode
  showBorder?: boolean
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  onFieldEdit?: (field: IndexField) => void
}

export interface IndexDetailsContainerProps {
  $showBorder?: boolean
}

export interface GetColumnsOptions {
  mode: IndexDetailsMode
  onFieldEdit?: (field: IndexField) => void
}
