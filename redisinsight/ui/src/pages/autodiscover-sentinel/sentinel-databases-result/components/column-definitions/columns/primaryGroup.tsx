import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import i18n from 'uiSrc/i18n'
import { SentinelDatabaseIds } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'
import { PrimaryGroupCell } from '../components'

export const primaryGroupColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: i18n.t('autodiscover.sentinel.column.primaryGroup'),
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
