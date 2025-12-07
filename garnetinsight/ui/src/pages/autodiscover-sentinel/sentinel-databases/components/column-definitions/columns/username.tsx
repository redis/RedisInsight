import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import {
  SentinelDatabaseIds,
  SentinelDatabaseTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

import { UsernameCell } from '../components'

export const usernameColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: SentinelDatabaseTitles.Username,
    id: SentinelDatabaseIds.Username,
    accessorKey: SentinelDatabaseIds.Username,
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
