import React from 'react'

import { CellText } from 'uiSrc/components/auto-discover'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

export const StatusResultCell = ({
  row,
}: CellContext<InstanceRedisCloud, unknown>) => {
  return <CellText className="column_status">{row.original.status}</CellText>
}
