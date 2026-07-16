import React from 'react'

import i18n from 'uiSrc/i18n'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { FieldTag } from 'uiSrc/pages/vector-search/components/field-tag/FieldTag'

import { IndexInfoTableData } from './IndexInfo.types'

export enum IndexInfoTableColumn {
  Identifier = 'identifier',
  Attribute = 'attribute',
  Type = 'type',
  Weight = 'weight',
  WithSuffixTrie = 'withSuffixTrie',
}

/**
 * Table columns for displaying index attributes.
 * Built at call time (not module scope) so headers resolve in the active
 * language when the table renders.
 */
export const getTableColumns = (): ColumnDef<IndexInfoTableData>[] => [
  {
    id: IndexInfoTableColumn.Identifier,
    accessorKey: IndexInfoTableColumn.Identifier,
    header: i18n.t('vectorSearch.indexInfo.column.identifier'),
  },
  {
    id: IndexInfoTableColumn.Attribute,
    accessorKey: IndexInfoTableColumn.Attribute,
    header: i18n.t('vectorSearch.indexInfo.column.attribute'),
  },
  {
    id: IndexInfoTableColumn.Type,
    accessorKey: IndexInfoTableColumn.Type,
    header: i18n.t('vectorSearch.indexInfo.column.type'),
    enableSorting: false,
    cell: ({ row }) => <FieldTag tag={row.original.type} />,
  },
  {
    id: IndexInfoTableColumn.Weight,
    accessorKey: IndexInfoTableColumn.Weight,
    header: i18n.t('vectorSearch.indexInfo.column.weight'),
    enableSorting: false,
  },
  {
    id: IndexInfoTableColumn.WithSuffixTrie,
    accessorKey: IndexInfoTableColumn.WithSuffixTrie,
    header: i18n.t('vectorSearch.indexInfo.column.withSuffixTrie'),
    enableSorting: false,
  },
]
