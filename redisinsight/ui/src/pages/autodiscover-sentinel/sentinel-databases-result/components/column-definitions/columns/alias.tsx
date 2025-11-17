import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type {
  ModifiedSentinelMaster,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'

import { AliasCell } from '../components'

export const aliasColumn = (
  handleChangedInput: (name: string, value: string) => void,
  errorNotAuth: (
    error?: string | object | null,
    status?: AddRedisDatabaseStatus,
  ) => boolean,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: 'Database Alias*',
    id: 'alias',
    accessorKey: 'alias',
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
