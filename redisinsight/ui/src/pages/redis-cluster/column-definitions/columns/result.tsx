import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'

import { ResultCell } from '../components/ResultCell'

export const resultColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: 'Result',
    id: 'messageAdded',
    accessorKey: 'messageAdded',
    enableSorting: true,
    cell: ({
      row: {
        original: { statusAdded, messageAdded },
      },
    }) => <ResultCell statusAdded={statusAdded} messageAdded={messageAdded} />,
  }
}

