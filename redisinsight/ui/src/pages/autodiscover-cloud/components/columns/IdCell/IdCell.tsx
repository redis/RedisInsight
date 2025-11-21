import React from 'react'

import { CellText } from 'uiSrc/components/auto-discover'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'

export const IdCell = ({ row }: CellContext<RedisCloudSubscription, unknown>) => {
  const { id } = row.original
  return <CellText data-testid={`id_${id}`}>{id}</CellText>
}

