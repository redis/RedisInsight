import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import {
  ColumnDefinitionIds,
  ColumnDefinitionTitles,
} from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

import { PasswordCell } from '../components'

export const passwordColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.Password,
    id: ColumnDefinitionIds.Password,
    accessorKey: ColumnDefinitionIds.Password,
    cell: ({
      row: {
        original: { password, id },
      },
    }) => (
      <PasswordCell
        password={password}
        id={id!}
        handleChangedInput={handleChangedInput}
      />
    ),
  }
}
