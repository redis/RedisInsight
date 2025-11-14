import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'

export const providerColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: 'provider',
    accessorKey: 'provider',
    header: 'Cloud provider',
    enableSorting: true,
    cell: ({
      row: {
        original: { provider },
      },
    }) => <CellText>{provider ?? '-'}</CellText>,
  }
}
