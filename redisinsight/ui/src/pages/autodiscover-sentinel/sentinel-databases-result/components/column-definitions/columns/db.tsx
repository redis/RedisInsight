import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import i18n from 'uiSrc/i18n'
import { SentinelDatabaseIds } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'
import { DbCell } from '../components'

export const dbColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: i18n.t('autodiscover.sentinel.column.databaseIndex'),
    id: SentinelDatabaseIds.DatabaseIndex,
    accessorKey: SentinelDatabaseIds.DatabaseIndex,
    size: 140,
    cell: ({
      row: {
        original: { db, id, loading = false, status, error },
      },
    }) => (
      <DbCell
        db={db}
        id={id}
        loading={loading}
        status={status}
        error={error}
        handleChangedInput={handleChangedInput}
      />
    ),
  }
}
