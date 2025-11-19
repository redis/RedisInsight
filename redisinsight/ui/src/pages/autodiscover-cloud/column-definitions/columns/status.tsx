import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  type RedisCloudSubscription,
  RedisCloudSubscriptionStatusText,
} from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const statusColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: AutoDiscoverCloudIds.Status,
    accessorKey: AutoDiscoverCloudIds.Status,
    header: AutoDiscoverCloudTitles.Status,
    enableSorting: true,
    cell: ({
      row: {
        original: { status },
      },
    }) => (
      <CellText>{RedisCloudSubscriptionStatusText[status] ?? '-'}</CellText>
    ),
  }
}
