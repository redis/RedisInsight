import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import { AliasCell } from '../components'
import {
  ColumnDefinitionIds,
  ColumnDefinitionTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

export const aliasColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.Alias,
    id: ColumnDefinitionIds.Alias,
    accessorKey: ColumnDefinitionIds.Alias,
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
