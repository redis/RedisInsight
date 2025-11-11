import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'

export const RegionColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: 'region',
    accessorKey: 'region',
    header: 'Region',
    enableSorting: true,
    cell: ({
      row: {
        original: { region },
      },
    }) => <CellText>{region ?? '-'}</CellText>,
  }
}
