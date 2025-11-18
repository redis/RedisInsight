import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  ModifiedSentinelMaster,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'
import { ColumnDefinitionTitles } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

export const PasswordColumn = (
  handleChangedInput: (name: string, value: string) => void,
  isInvalid: boolean,
  errorNotAuth: (
    error?: string | object | null,
    status?: AddRedisDatabaseStatus,
  ) => boolean,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.Password,
    id: 'password',
    accessorKey: 'password',
    cell: ({
      row: {
        original: { password, id, error, loading = false, status },
      },
    }) => {
      if (
        errorNotAuth(error, status) ||
        status === AddRedisDatabaseStatus.Success
      ) {
        return password ? '************' : <i>not assigned</i>
      }
      return (
        <div role="presentation" style={{ position: 'relative' }}>
          <InputFieldSentinel
            isInvalid={isInvalid}
            value={password}
            name={`password-${id}`}
            placeholder="Enter Password"
            disabled={loading}
            inputType={SentinelInputFieldType.Password}
            onChangedInput={handleChangedInput}
          />
        </div>
      )
    },
  }
}
