import React from 'react'
import i18n from 'uiSrc/i18n'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  type InstanceRedisCloud,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'

import { CellText } from 'uiSrc/components/auto-discover'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const subscriptionTypeColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: i18n.t('autodiscover.cloud.column.type'),
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
