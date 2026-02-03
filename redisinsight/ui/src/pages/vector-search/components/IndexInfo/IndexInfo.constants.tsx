import React from 'react'

import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { FieldTag } from 'uiSrc/components/new-index/create-index-step/field-box/FieldTag'

import { IndexInfoTableData } from './IndexInfo.types'

export enum IndexInfoTableColumn {
  Identifier = 'identifier',
  Attribute = 'attribute',
  Type = 'type',
  Weight = 'weight',
}

/**
 * Table columns for displaying index attributes.
 */
export const TABLE_COLUMNS: ColumnDef<IndexInfoTableData>[] = [
  {
    id: IndexInfoTableColumn.Identifier,
    accessorKey: IndexInfoTableColumn.Identifier,
    header: 'Identifier',
  },
  {
    id: IndexInfoTableColumn.Attribute,
    accessorKey: IndexInfoTableColumn.Attribute,
    header: 'Attribute',
  },
  {
    id: IndexInfoTableColumn.Type,
    accessorKey: IndexInfoTableColumn.Type,
    header: 'Type',
    enableSorting: false,
    cell: ({ row }) => <FieldTag tag={row.original.type} />,
  },
  {
    id: IndexInfoTableColumn.Weight,
    accessorKey: IndexInfoTableColumn.Weight,
    header: 'Weight',
    enableSorting: false,
  },
]
