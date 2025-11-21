import React from 'react'

import { CellText } from 'uiSrc/components/auto-discover'
import { CellContext } from 'uiSrc/components/base/layout/table'
import {
  InstanceRedisCloud,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'

export const SubscriptionTypeCell = ({
  row,
}: CellContext<InstanceRedisCloud, unknown>) => {
  const { subscriptionType } = row.original
  return (
    <CellText>
      {RedisCloudSubscriptionTypeText[subscriptionType!] ?? '-'}
    </CellText>
  )
}

