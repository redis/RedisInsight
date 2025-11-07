import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

export const UsernameColumn = (
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
      <div role="presentation">
        <InputFieldSentinel
          value={username}
          name={`username-${id}`}
          placeholder="Enter Username"
          inputType={SentinelInputFieldType.Text}
          onChangedInput={handleChangedInput}
        />
      </div>
    ),
  }
}
