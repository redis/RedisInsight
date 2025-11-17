import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import { PasswordCell } from '../components'

export const passwordColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: 'Password',
    id: 'password',
    accessorKey: 'password',
    cell: ({
      row: {
        original: { password, id },
      },
    }) => (
      <PasswordCell
        password={password}
        id={id}
        handleChangedInput={handleChangedInput}
      />
    ),
  }
}
