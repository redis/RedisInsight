import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'

export const idColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: 'id',
    accessorKey: 'id',
    header: 'Id',
    enableSorting: true,
    size: 80,
    cell: ({
      row: {
        original: { id },
      },
    }) => <CellText data-testid={`id_${id}`}>{id}</CellText>,
  }
}
