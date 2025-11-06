import React from 'react'
import { CellText } from 'uiSrc/components/auto-discover'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

export const PrimaryGroupColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: 'Primary Group',
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    size: 200,
    cell: ({
      row: {
        original: { name },
      },
    }) => <CellText data-testid={`primary-group_${name}`}>{name}</CellText>,
  }
}
