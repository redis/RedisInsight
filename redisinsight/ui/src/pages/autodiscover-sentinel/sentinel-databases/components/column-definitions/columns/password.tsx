import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import i18n from 'uiSrc/i18n'
import { SentinelDatabaseIds } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

import { PasswordCell } from '../components'

export const passwordColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: i18n.t('autodiscover.sentinel.column.password'),
    id: SentinelDatabaseIds.Password,
    accessorKey: SentinelDatabaseIds.Password,
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
