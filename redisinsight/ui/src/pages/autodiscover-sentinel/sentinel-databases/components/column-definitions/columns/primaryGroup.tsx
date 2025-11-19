import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import {
  ColumnDefinitionIds,
  ColumnDefinitionTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'
import { PrimaryGroupCell } from '../components'

export const primaryGroupColumn = (): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.PrimaryGroup,
    id: ColumnDefinitionIds.PrimaryGroup,
    accessorKey: ColumnDefinitionIds.PrimaryGroup,
    enableSorting: true,
    size: 200,
    cell: ({
      row: {
        original: { name },
      },
    }) => <PrimaryGroupCell name={name} />,
  }
}
