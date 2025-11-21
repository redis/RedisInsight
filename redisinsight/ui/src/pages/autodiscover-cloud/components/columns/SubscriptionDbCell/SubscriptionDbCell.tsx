import React from 'react'

import { SubscriptionCellRenderer } from '../SubscriptionCell/SubscriptionCell'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

export const SubscriptionDbCell = ({
  row,
}: CellContext<InstanceRedisCloud, unknown>) => {
  const { subscriptionName: name } = row.original
  return <SubscriptionCellRenderer name={name} />
}

