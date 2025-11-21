import React from 'react'

import { CellText } from 'uiSrc/components/auto-discover'
import { CellContext } from 'uiSrc/components/base/layout/table'
import {
  RedisCloudSubscription,
  RedisCloudSubscriptionStatusText,
} from 'uiSrc/slices/interfaces'

export const StatusCell = ({
  row,
}: CellContext<RedisCloudSubscription, unknown>) => {
  const { status } = row.original
  return <CellText>{RedisCloudSubscriptionStatusText[status] ?? '-'}</CellText>
}

