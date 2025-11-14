import React from 'react'

import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import { MessageResultCell } from './components/MessageResultCell/MessageResultCell'

export const messageResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Result',
    id: 'messageAdded',
    accessorKey: 'messageAdded',
    enableSorting: true,
    minSize: 110,
    cell: ({
      row: {
        original: { statusAdded, messageAdded },
      },
    }) => (
      <MessageResultCell statusAdded={statusAdded} messageAdded={messageAdded} />
    ),
  }
}
