import React from 'react'

import { CellText } from 'uiSrc/components/auto-discover'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

export const SubscriptionIdCell = ({
  row,
}: CellContext<InstanceRedisCloud, unknown>) => {
  const { subscriptionId } = row.original
  return (
    <CellText data-testid={`sub_id_${subscriptionId}`}>
      {subscriptionId}
    </CellText>
  )
}

