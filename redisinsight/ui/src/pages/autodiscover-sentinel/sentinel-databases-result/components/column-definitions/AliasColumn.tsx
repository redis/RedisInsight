import React from 'react'
import { CellText } from 'uiSrc/components/auto-discover'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  ModifiedSentinelMaster,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'
import { ColumnDefinitionTitles } from 'uiSrc/pages/autodiscover-sentinel/constants/constants'

export const AliasColumn = (
  handleChangedInput: (name: string, value: string) => void,
  errorNotAuth: (
    error?: string | object | null,
    status?: AddRedisDatabaseStatus,
  ) => boolean,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: ColumnDefinitionTitles.Alias,
    id: 'alias',
    accessorKey: 'alias',
    enableSorting: true,
    cell: ({
      row: {
        original: { id, alias, error, loading = false, status },
      },
    }) => {
      if (errorNotAuth(error, status)) {
        return <CellText>{alias}</CellText>
      }
      return (
        <InputFieldSentinel
          name={`alias-${id}`}
          value={alias}
          placeholder="Database"
          disabled={loading}
          inputType={SentinelInputFieldType.Text}
          onChangedInput={handleChangedInput}
          maxLength={500}
        />
      )
    },
  }
}
