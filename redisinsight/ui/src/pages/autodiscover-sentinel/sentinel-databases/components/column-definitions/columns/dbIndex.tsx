import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import { DbIndexCell } from '../components'
import {
  SentinelDatabaseIds,
  SentinelDatabaseTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

export const dbIndexColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: SentinelDatabaseTitles.DatabaseIndex,
    id: SentinelDatabaseIds.DatabaseIndex,
    accessorKey: SentinelDatabaseIds.DatabaseIndex,
    size: 140,
    cell: ({
      row: {
        original: { db = 0, id },
      },
    }) => (
      <DbIndexCell db={db} id={id!} handleChangedInput={handleChangedInput} />
    ),
  }
}
