import { ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  GetColumnsOptions,
  IndexDetailsMode,
  IndexField,
} from './IndexDetails.types'
import {
  SELECTION_COLUMN,
  NAME_COLUMN,
  VALUE_COLUMN,
  TYPE_COLUMN_READONLY,
  TYPE_COLUMN_EDITABLE,
  createActionsColumn,
} from './IndexDetails.columns'

const READONLY_COLUMNS: ColumnDef<IndexField>[] = [
  NAME_COLUMN,
  VALUE_COLUMN,
  TYPE_COLUMN_READONLY,
]

const EDITABLE_BASE_COLUMNS: ColumnDef<IndexField>[] = [
  SELECTION_COLUMN,
  NAME_COLUMN,
  VALUE_COLUMN,
  TYPE_COLUMN_EDITABLE,
]

export const getIndexDetailsColumns = ({
  mode,
  onFieldEdit,
}: GetColumnsOptions): ColumnDef<IndexField>[] => {
  if (mode === IndexDetailsMode.Readonly) {
    return READONLY_COLUMNS
  }

  return [...EDITABLE_BASE_COLUMNS, createActionsColumn(onFieldEdit)]
}
