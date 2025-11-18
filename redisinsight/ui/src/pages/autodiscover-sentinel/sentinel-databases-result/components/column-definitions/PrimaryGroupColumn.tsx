import React from 'react'
import { CellText } from 'uiSrc/components/auto-discover'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { ColumnDefinitionTitles } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

export const PrimaryGroupColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.PrimaryGroup,
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    maxSize: 200,
    cell: ({
      row: {
        original: { name },
      },
    }) => <CellText data-testid={`primary-group_${name}`}>{name}</CellText>,
  }
}
