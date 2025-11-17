import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import { PrimaryGroupCell } from '../components'

export const primaryGroupColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: 'Primary Group',
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    maxSize: 200,
    cell: ({
      row: {
        original: { name },
      },
    }) => <PrimaryGroupCell name={name} />,
  }
}
