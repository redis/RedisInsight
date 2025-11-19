import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type {
  ModifiedSentinelMaster,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'
import {
  SentinelDatabaseIds,
  SentinelDatabaseTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'
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
    header: SentinelDatabaseTitles.Password,
    id: SentinelDatabaseIds.Password,
    accessorKey: SentinelDatabaseIds.Password,
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
