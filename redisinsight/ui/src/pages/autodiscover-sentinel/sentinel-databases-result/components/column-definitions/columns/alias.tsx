import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type {
  ModifiedSentinelMaster,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'
import i18n from 'uiSrc/i18n'
import { SentinelDatabaseIds } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'
import { AliasCell } from '../components'

export const aliasColumn = (
  handleChangedInput: (name: string, value: string) => void,
  errorNotAuth: (
    error?: string | object | null,
    status?: AddRedisDatabaseStatus,
  ) => boolean,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: i18n.t('autodiscover.sentinel.column.alias'),
    id: SentinelDatabaseIds.Alias,
    accessorKey: SentinelDatabaseIds.Alias,
    enableSorting: true,
    cell: ({
      row: {
        original: { id, alias, error, loading = false, status },
      },
    }) => (
      <AliasCell
        id={id}
        alias={alias}
        error={error}
        loading={loading}
        status={status}
        handleChangedInput={handleChangedInput}
        errorNotAuth={errorNotAuth}
      />
    ),
  }
}
