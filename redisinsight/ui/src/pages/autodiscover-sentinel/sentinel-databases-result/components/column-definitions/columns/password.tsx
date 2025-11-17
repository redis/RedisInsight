import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type {
  ModifiedSentinelMaster,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'

import { PasswordCell } from '../components'

export const passwordColumn = (
  handleChangedInput: (name: string, value: string) => void,
  isInvalid: boolean,
  errorNotAuth: (
    error?: string | object | null,
    status?: AddRedisDatabaseStatus,
  ) => boolean,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: 'Password',
    id: 'password',
    accessorKey: 'password',
    cell: ({
      row: {
        original: { password, id, error, loading = false, status },
      },
    }) => (
      <PasswordCell
        password={password}
        id={id}
        error={error}
        loading={loading}
        status={status}
        handleChangedInput={handleChangedInput}
        isInvalid={isInvalid}
        errorNotAuth={errorNotAuth}
      />
    ),
  }
}
