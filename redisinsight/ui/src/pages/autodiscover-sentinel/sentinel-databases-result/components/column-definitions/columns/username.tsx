import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type {
  ModifiedSentinelMaster,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'
import i18n from 'uiSrc/i18n'
import { SentinelDatabaseIds } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'
import { UsernameCell } from '../components'

export const usernameColumn = (
  handleChangedInput: (name: string, value: string) => void,
  isInvalid: boolean,
  errorNotAuth: (
    error?: string | object | null,
    status?: AddRedisDatabaseStatus,
  ) => boolean,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: i18n.t('autodiscover.sentinel.column.username'),
    id: SentinelDatabaseIds.Username,
    accessorKey: SentinelDatabaseIds.Username,
    cell: ({
      row: {
        original: { username, id, loading = false, error, status },
      },
    }) => (
      <UsernameCell
        username={username}
        id={id}
        loading={loading}
        error={error}
        status={status}
        handleChangedInput={handleChangedInput}
        isInvalid={isInvalid}
        errorNotAuth={errorNotAuth}
      />
    ),
  }
}
