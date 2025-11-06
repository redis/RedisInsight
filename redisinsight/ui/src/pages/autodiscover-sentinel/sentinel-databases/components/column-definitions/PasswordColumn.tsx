import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

export const PasswordColumn = (
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
      <div role="presentation">
        <InputFieldSentinel
          value={password}
          name={`password-${id}`}
          placeholder="Enter Password"
          inputType={SentinelInputFieldType.Password}
          onChangedInput={handleChangedInput}
        />
      </div>
    ),
  }
}
