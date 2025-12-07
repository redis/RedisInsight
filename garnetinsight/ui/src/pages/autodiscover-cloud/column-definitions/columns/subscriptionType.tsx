import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  type InstanceRedisCloud,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'
import {
  AutoDiscoverCloudIds,
  AutoDiscoverCloudTitles,
} from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const subscriptionTypeColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: AutoDiscoverCloudTitles.Type,
    id: AutoDiscoverCloudIds.SubscriptionType,
    accessorKey: AutoDiscoverCloudIds.SubscriptionType,
    enableSorting: true,
    maxSize: 100,
    cell: ({
      row: {
        original: { subscriptionType },
      },
    }) => (
      <CellText>
        {RedisCloudSubscriptionTypeText[subscriptionType!] ?? '-'}
      </CellText>
    ),
  }
}
