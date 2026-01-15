import React from 'react'

import { Instance } from 'uiSrc/slices/interfaces'
import {
  ColumnDef,
  SortingState,
  Table,
} from 'uiSrc/components/base/layout/table'
import {
  BrowserStorageItem,
  COLUMN_FIELD_NAME_MAP,
  DatabaseListColumn,
  DEFAULT_SORT,
} from 'uiSrc/constants'
import { localStorageService } from 'uiSrc/services'

import DatabasesListCellName from './components/DatabasesListCellName/DatabasesListCellName'
import DatabasesListCellHost from './components/DatabasesListCellHost/DatabasesListCellHost'
import DatabasesListCellConnectionType from './components/DatabasesListCellConnectionType/DatabasesListCellConnectionType'
import DatabasesListCellLastConnection from './components/DatabasesListCellLastConnection/DatabasesListCellLastConnection'
import DatabasesListCellModules from './components/DatabasesListCellModules/DatabasesListCellModules'
import DatabasesListCellControls from './components/DatabasesListCellControls/DatabasesListCellControls'
import DatabasesListCellTags from './components/DatabasesListCellTags/DatabasesListCellTags'
import { TagsCellHeader } from '../tags-cell/TagsCellHeader'

export const SELECT_COL_ID = 'select-col-db'

export const ENABLE_PAGINATION_COUNT = 15

export const DEFAULT_SORTING: SortingState = [
  {
    id: (
      localStorageService.get(BrowserStorageItem.instancesSorting) ??
      DEFAULT_SORT
    ).field,
    desc:
      (
        localStorageService.get(BrowserStorageItem.instancesSorting) ??
        DEFAULT_SORT
      ).direction === 'desc',
  },
]

export const BASE_COLUMNS: ColumnDef<Instance>[] = [
  {
    id: SELECT_COL_ID,
    size: 40,
    isHeaderCustom: true,
    enableSorting: false,
    header: Table.HeaderMultiRowSelectionButton,
    cell: ({ row }) => (
      <Table.RowSelectionButton
        row={row}
        onClick={(e: any) => e.stopPropagation()}
      />
    ),
  },
  {
    id: DatabaseListColumn.Name,
    accessorKey: DatabaseListColumn.Name,
    header: COLUMN_FIELD_NAME_MAP.get(DatabaseListColumn.Name),
    enableSorting: true,
    cell: DatabasesListCellName,
    sortingFn: (rowA, rowB) => {
      return `${rowA.original.name?.toLowerCase()}`.localeCompare(
        `${rowB.original.name?.toLowerCase()}`,
      )
    },
  },
  {
    id: DatabaseListColumn.Host,
    accessorKey: DatabaseListColumn.Host,
    header: COLUMN_FIELD_NAME_MAP.get(DatabaseListColumn.Host),
    enableSorting: true,
    cell: DatabasesListCellHost,
    sortingFn: (rowA, rowB) => {
      return `${rowA.original.host?.toLowerCase()}:${rowA.original.port}`.localeCompare(
        `${rowB.original.host?.toLowerCase()}:${rowB.original.port}`,
      )
    },
  },
  {
    id: DatabaseListColumn.ConnectionType,
    accessorKey: DatabaseListColumn.ConnectionType,
    header: COLUMN_FIELD_NAME_MAP.get(DatabaseListColumn.ConnectionType),
    enableSorting: true,
    cell: DatabasesListCellConnectionType,
  },
  {
    id: DatabaseListColumn.Modules,
    accessorKey: DatabaseListColumn.Modules,
    header: COLUMN_FIELD_NAME_MAP.get(DatabaseListColumn.Modules),
    enableSorting: false,
    cell: DatabasesListCellModules,
  },
  {
    id: DatabaseListColumn.LastConnection,
    accessorKey: DatabaseListColumn.LastConnection,
    header: COLUMN_FIELD_NAME_MAP.get(DatabaseListColumn.LastConnection),
    enableSorting: true,
    sortingFn: (rowA, rowB) => {
      const conn1 = rowA.original.lastConnection
      const conn2 = rowB.original.lastConnection
      if (conn1 && conn2) {
        return new Date(conn2).getTime() - new Date(conn1).getTime()
      }
      if (conn1 && !conn2) {
        return -1
      }
      if (!conn1 && conn2) {
        return 1
      }
      return 0
    },
    cell: DatabasesListCellLastConnection,
  },
  {
    id: DatabaseListColumn.Tags,
    accessorKey: DatabaseListColumn.Tags,
    isHeaderCustom: true,
    header: TagsCellHeader,
    enableSorting: true,
    cell: DatabasesListCellTags,
    sortingFn: (rowA, rowB) => {
      // compare value of first tag only
      const tagA = rowA.original.tags?.[0]
      const tagB = rowB.original.tags?.[0]

      return `${tagA?.key || ''}:${tagA?.value || ''}`
        .toLowerCase()
        .localeCompare(`${tagB?.key || ''}:${tagB?.value || ''}`.toLowerCase())
    },
  },
  {
    id: DatabaseListColumn.Controls,
    accessorKey: DatabaseListColumn.Controls,
    header: '',
    enableSorting: false,
    cell: DatabasesListCellControls,
  },
]
