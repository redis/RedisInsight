import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'
import { CellText } from 'uiSrc/components/auto-discover'
import { isNumber } from 'lodash'

export const NUMBER_OF_DBS_COLUMN_ID = 'numberOfDatabases' as const

export const numberOfDbsColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: NUMBER_OF_DBS_COLUMN_ID,
    accessorKey: NUMBER_OF_DBS_COLUMN_ID,
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
