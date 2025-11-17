import React from 'react'
import type { ColumnDef } from 'uiSrc/components/base/layout/table'
import type { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

import { UsernameCell } from '../components'

export const usernameColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: 'Username',
    id: 'username',
    accessorKey: 'username',
    cell: ({
      row: {
        original: { username, id },
      },
    }) => (
      <UsernameCell
        username={username!}
        id={id!}
        handleChangedInput={handleChangedInput}
      />
    ),
  }
}
