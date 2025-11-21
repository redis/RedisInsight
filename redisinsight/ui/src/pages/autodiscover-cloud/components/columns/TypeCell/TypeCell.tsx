import React from 'react'

import { CellText } from 'uiSrc/components/auto-discover'
import { CellContext } from 'uiSrc/components/base/layout/table'
import {
  RedisCloudSubscription,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'

export const TypeCell = ({ row }: CellContext<RedisCloudSubscription, unknown>) => {
  const { type } = row.original
  return <CellText>{RedisCloudSubscriptionTypeText[type] ?? '-'}</CellText>
}

