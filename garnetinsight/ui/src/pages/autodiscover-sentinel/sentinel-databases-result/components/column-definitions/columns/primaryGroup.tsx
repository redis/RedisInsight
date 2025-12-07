import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import {
  SentinelDatabaseIds,
  SentinelDatabaseTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'
import { PrimaryGroupCell } from '../components'

export const primaryGroupColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: SentinelDatabaseTitles.PrimaryGroup,
    id: SentinelDatabaseIds.PrimaryGroup,
    accessorKey: SentinelDatabaseIds.PrimaryGroup,
    enableSorting: true,
    maxSize: 200,
    cell: ({
      row: {
        original: { name },
      },
    }) => <PrimaryGroupCell name={name} />,
  }
}
