import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type {
  ModifiedSentinelMaster,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'

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
    header: 'Username',
    id: 'username',
    accessorKey: 'username',
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
