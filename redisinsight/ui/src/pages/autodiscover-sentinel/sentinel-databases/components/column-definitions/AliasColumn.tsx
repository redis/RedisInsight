import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

export const AliasColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: 'Database Alias*',
    id: 'alias',
    accessorKey: 'alias',
    enableSorting: true,
    size: 200,
    cell: ({
      row: {
        original: { id, alias, name },
      },
    }) => (
      <div role="presentation">
        <InputFieldSentinel
          name={`alias-${id}`}
          value={alias || name}
          placeholder="Enter Database Alias"
          inputType={SentinelInputFieldType.Text}
          onChangedInput={handleChangedInput}
          maxLength={500}
        />
      </div>
    ),
  }
}
