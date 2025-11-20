import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import { AlertCell } from '../components/AlertCell/AlertCell'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const alertColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: AutoDiscoverCloudIds.Alert,
    accessorKey: AutoDiscoverCloudIds.Alert,
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
