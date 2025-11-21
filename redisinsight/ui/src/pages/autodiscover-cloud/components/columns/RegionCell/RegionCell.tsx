import React from 'react'

import { CellText } from 'uiSrc/components/auto-discover'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'

export const RegionCell = ({ row }: CellContext<RedisCloudSubscription, unknown>) => {
  const { region } = row.original
  return <CellText>{region ?? '-'}</CellText>
}

