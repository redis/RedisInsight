import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import { AlertCell } from '../components/AlertCell/AlertCell'

export const ALERT_COLUMN_ID = 'alert' as const

export const alertColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: ALERT_COLUMN_ID,
    accessorKey: ALERT_COLUMN_ID,
    header: '',
    enableResizing: false,
    enableSorting: false,
    size: 50,
    cell: ({
      row: {
        original: { status, numberOfDatabases },
      },
    }) => <AlertCell status={status} numberOfDatabases={numberOfDatabases} />,
  }
}
