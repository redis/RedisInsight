import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import i18n from 'uiSrc/i18n'
import { SentinelDatabaseIds } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

import { UsernameCell } from '../components'

export const usernameColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: i18n.t('autodiscover.sentinel.column.username'),
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
