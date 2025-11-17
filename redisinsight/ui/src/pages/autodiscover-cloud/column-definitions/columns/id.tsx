import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'

export const ID_COLUMN_ID = 'id' as const

export const idColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: ID_COLUMN_ID,
    accessorKey: ID_COLUMN_ID,
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
