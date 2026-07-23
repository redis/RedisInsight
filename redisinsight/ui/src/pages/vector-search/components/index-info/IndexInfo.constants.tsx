import React from 'react'

import i18n from 'uiSrc/i18n'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { FieldTag } from 'uiSrc/pages/vector-search/components/field-tag/FieldTag'
import {
  INDEX_ATTRIBUTE_BOOLEAN_FLAGS,
  IndexAttributeBooleanFlag,
} from 'uiSrc/pages/vector-search/hooks/useIndexInfo/useIndexInfo.constants'

import { IndexInfoTableData } from './IndexInfo.types'

export enum IndexInfoTableColumn {
  Identifier = 'identifier',
  Attribute = 'attribute',
  Type = 'type',
  Weight = 'weight',
}

const booleanFlagColumn = (
  flag: IndexAttributeBooleanFlag,
): ColumnDef<IndexInfoTableData> => ({
  id: flag,
  accessorKey: flag,
  header: flag,
  enableSorting: false,
  cell: ({ row }) => {
    const enabled = Boolean(row.original[flag])
    return (
      <div data-testid={`index-info--boolean-flag-${flag}`}>
        <RiIcon
          type={enabled ? 'CheckThinIcon' : 'CancelSlimIcon'}
          color={enabled ? 'primary500' : 'danger600'}
        />
      </div>
    )
  },
})

/**
 * Boolean FT.INFO flags present on at least one attribute row.
 * Preserves the canonical flag order.
 */
export const getPresentBooleanFlags = (
  rows: IndexInfoTableData[],
): IndexAttributeBooleanFlag[] =>
  INDEX_ATTRIBUTE_BOOLEAN_FLAGS.filter((flag) =>
    rows.some((row) => Boolean(row[flag])),
  )

const hasWeightColumn = (rows: IndexInfoTableData[]): boolean =>
  rows.some((row) => row.weight != null && row.weight !== '')

/**
 * Table columns for displaying index attributes.
 * Built at call time so headers resolve in the active language, and so
 * Weight / boolean FT.INFO flag columns are included only when present.
 */
export const getTableColumns = (
  rows: IndexInfoTableData[] = [],
): ColumnDef<IndexInfoTableData>[] => {
  const columns: ColumnDef<IndexInfoTableData>[] = [
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
  ]

  if (hasWeightColumn(rows)) {
    columns.push({
      id: IndexInfoTableColumn.Weight,
      accessorKey: IndexInfoTableColumn.Weight,
      header: i18n.t('vectorSearch.indexInfo.column.weight'),
      enableSorting: false,
    })
  }

  columns.push(...getPresentBooleanFlags(rows).map(booleanFlagColumn))

  return columns
}
