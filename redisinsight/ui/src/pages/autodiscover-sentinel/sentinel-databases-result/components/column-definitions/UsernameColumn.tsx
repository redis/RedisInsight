import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  ModifiedSentinelMaster,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'
import { ColumnDefinitionTitles } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

export const UsernameColumn = (
  handleChangedInput: (name: string, value: string) => void,
  isInvalid: boolean,
  errorNotAuth: (
    error?: string | object | null,
    status?: AddRedisDatabaseStatus,
  ) => boolean,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.Username,
    id: 'username',
    accessorKey: 'username',
    cell: ({
      row: {
        original: { username, id, loading = false, error, status },
      },
    }) => {
      if (
        errorNotAuth(error, status) ||
        status === AddRedisDatabaseStatus.Success
      ) {
        return username || <i>Default</i>
      }
      return (
        <div role="presentation" style={{ position: 'relative' }}>
          <InputFieldSentinel
            isText
            isInvalid={isInvalid}
            value={username}
            name={`username-${id}`}
            placeholder="Enter Username"
            disabled={loading}
            inputType={SentinelInputFieldType.Text}
            onChangedInput={handleChangedInput}
          />
        </div>
      )
    },
  }
}
