import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import {
  ColumnDefinitionIds,
  ColumnDefinitionTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

import { UsernameCell } from '../components'

export const usernameColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.Username,
    id: ColumnDefinitionIds.Username,
    accessorKey: ColumnDefinitionIds.Username,
    cell: ({
      row: {
        original: { username, id },
      },
    }) => (
      <UsernameCell
        username={username!}
        id={id!}
        handleChangedInput={handleChangedInput}
      />
    ),
  }
}
