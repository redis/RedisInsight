import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'

export const PROVIDER_COLUMN_ID = 'provider' as const

export const providerColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: PROVIDER_COLUMN_ID,
    accessorKey: PROVIDER_COLUMN_ID,
    header: 'Cloud provider',
    enableSorting: true,
    cell: ({
      row: {
        original: { provider },
      },
    }) => <CellText>{provider ?? '-'}</CellText>,
  }
}
