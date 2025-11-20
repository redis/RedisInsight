import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  type RedisCloudSubscription,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const typeColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: AutoDiscoverCloudIds.Type,
    accessorKey: AutoDiscoverCloudIds.Type,
    header: AutoDiscoverCloudTitles.Type,
    enableSorting: true,
    cell: ({
      row: {
        original: { type },
      },
    }) => <CellText>{RedisCloudSubscriptionTypeText[type] ?? '-'}</CellText>,
  }
}
