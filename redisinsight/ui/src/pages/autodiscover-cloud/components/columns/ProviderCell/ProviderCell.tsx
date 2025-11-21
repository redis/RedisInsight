import React from 'react'

import { CellText } from 'uiSrc/components/auto-discover'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'

export const ProviderCell = ({
  row,
}: CellContext<RedisCloudSubscription, unknown>) => {
  const { provider } = row.original
  return <CellText>{provider ?? '-'}</CellText>
}

