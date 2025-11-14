import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'

export const REGION_COLUMN_ID = 'region' as const

export const regionColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: REGION_COLUMN_ID,
    accessorKey: REGION_COLUMN_ID,
    header: 'Region',
    enableSorting: true,
    cell: ({
      row: {
        original: { region },
      },
    }) => <CellText>{region ?? '-'}</CellText>,
  }
}
