import React from 'react'
import { isNumber } from 'lodash'

import { CellText } from 'uiSrc/components/auto-discover'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'

export const NumberOfDatabasesCell = ({
  row,
}: CellContext<RedisCloudSubscription, unknown>) => {
  const { numberOfDatabases } = row.original
  return (
    <CellText>
      {isNumber(numberOfDatabases) ? numberOfDatabases : '-'}
    </CellText>
  )
}

