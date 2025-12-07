import React from 'react'

import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import {
  SentinelDatabaseIds,
  SentinelDatabaseTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'
import { ResultCell } from '../components'

export const resultColumn = (
  addActions?: boolean,
  onAddInstance?: (name: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: SentinelDatabaseTitles.Result,
    id: SentinelDatabaseIds.Message,
    accessorKey: SentinelDatabaseIds.Message,
    enableSorting: true,
    minSize: addActions ? 250 : 110,
    cell: ({
      row: {
        original: { status, message, name, error, alias, loading = false },
      },
    }) => (
      <ResultCell
        status={status}
        message={message}
        name={name}
        error={error}
        alias={alias}
        loading={loading}
        addActions={addActions}
        onAddInstance={onAddInstance}
      />
    ),
  }
}
