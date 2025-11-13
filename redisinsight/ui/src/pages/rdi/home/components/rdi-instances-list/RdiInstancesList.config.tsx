import React from 'react'

import { ColumnDef, Table } from 'uiSrc/components/base/layout/table'
import { RDI_COLUMN_FIELD_NAME_MAP, RdiListColumn } from 'uiSrc/constants'
import { RdiInstance } from 'uiSrc/slices/interfaces'

import RdiInstancesListCellControls from './components/RdiInstancesListCellControls/RdiInstancesListCellControls'
import RdiInstancesListCell from './components/RdiInstancesListCell/RdiInstancesListCell'

export const SELECT_COL_ID = 'select-col-rdi'
export const ENABLE_PAGINATION_COUNT = 15

export const BASE_COLUMNS: ColumnDef<RdiInstance>[] = [
  {
    id: SELECT_COL_ID,
    size: 40,
    isHeaderCustom: true,
    enableSorting: false,
    header: Table.HeaderMultiRowSelectionButton,
    cell: (props) => (
      <Table.RowSelectionButton
        {...props}
        onClick={(e: any) => e.stopPropagation()}
      />
    ),
  },
  {
    id: RdiListColumn.Name,
    accessorKey: RdiListColumn.Name,
    header: RDI_COLUMN_FIELD_NAME_MAP.get(RdiListColumn.Name),
    enableSorting: true,
    cell: (props) => (
      <RdiInstancesListCell {...props} field={RdiListColumn.Name} />
    ),
    sortingFn: (rowA, rowB) =>
      `${rowA.original.name?.toLowerCase()}`.localeCompare(
        `${rowB.original.name?.toLowerCase()}`,
      ),
  },
  {
    id: RdiListColumn.Url,
    accessorKey: RdiListColumn.Url,
    header: RDI_COLUMN_FIELD_NAME_MAP.get(RdiListColumn.Url),
    enableSorting: true,
    cell: (props) => (
      <RdiInstancesListCell {...props} field={RdiListColumn.Url} withCopyIcon />
    ),
    sortingFn: (rowA, rowB) =>
      `${rowA.original.url?.toLowerCase()}`.localeCompare(
        `${rowB.original.url?.toLowerCase()}`,
      ),
  },
  {
    id: RdiListColumn.Version,
    accessorKey: RdiListColumn.Version,
    header: RDI_COLUMN_FIELD_NAME_MAP.get(RdiListColumn.Version),
    enableSorting: true,
    cell: (props) => (
      <RdiInstancesListCell {...props} field={RdiListColumn.Version} />
    ),
  },
  {
    id: RdiListColumn.LastConnection,
    accessorKey: RdiListColumn.LastConnection,
    header: RDI_COLUMN_FIELD_NAME_MAP.get(RdiListColumn.LastConnection),
    enableSorting: true,
    cell: (props) => (
      <RdiInstancesListCell {...props} field={RdiListColumn.LastConnection} />
    ),
    sortingFn: (rowA, rowB) => {
      const a = rowA.original.lastConnection
      const b = rowB.original.lastConnection
      const getTime = (v: any) => (v ? new Date(`${v}`).getTime() : -Infinity)
      return getTime(a) - getTime(b)
    },
  },
  {
    id: RdiListColumn.Controls,
    accessorKey: RdiListColumn.Controls,
    header: '',
    enableSorting: false,
    cell: RdiInstancesListCellControls,
  },
]
