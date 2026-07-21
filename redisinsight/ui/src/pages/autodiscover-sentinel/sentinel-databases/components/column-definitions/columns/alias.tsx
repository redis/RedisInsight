import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import { AliasCell } from '../components'
import i18n from 'uiSrc/i18n'
import { SentinelDatabaseIds } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

export const aliasColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: i18n.t('autodiscover.sentinel.column.alias'),
    id: SentinelDatabaseIds.Alias,
    accessorKey: SentinelDatabaseIds.Alias,
    enableSorting: true,
    size: 200,
    cell: ({
      row: {
        original: { id, alias, name },
      },
    }) => (
      <AliasCell
        id={id}
        alias={alias}
        name={name}
        handleChangedInput={handleChangedInput}
      />
    ),
  }
}
