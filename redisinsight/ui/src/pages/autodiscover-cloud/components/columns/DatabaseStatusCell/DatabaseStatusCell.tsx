import React from 'react'

import { StatusColumnText } from 'uiSrc/components/auto-discover'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

export const DatabaseStatusCell = ({
  row,
}: CellContext<InstanceRedisCloud, unknown>) => {
  const { status } = row.original
  return <StatusColumnText>{status}</StatusColumnText>
}

