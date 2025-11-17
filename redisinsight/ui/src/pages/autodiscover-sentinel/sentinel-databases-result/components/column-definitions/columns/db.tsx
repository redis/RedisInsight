import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import { DbCell } from '../components'

export const dbColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: 'Database Index',
    id: 'db',
    accessorKey: 'db',
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
