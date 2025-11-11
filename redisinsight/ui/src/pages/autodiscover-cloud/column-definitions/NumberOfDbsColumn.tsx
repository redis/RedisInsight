import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'
import { isNumber } from 'lodash'

export const NumberOfDbsColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: 'numberOfDatabases',
    accessorKey: 'numberOfDatabases',
    header: '# databases',
    enableSorting: true,
    cell: ({
      row: {
        original: { numberOfDatabases },
      },
    }) => (
      <CellText>
        {isNumber(numberOfDatabases) ? numberOfDatabases : '-'}
      </CellText>
    ),
  }
}
