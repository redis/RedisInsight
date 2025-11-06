import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  ModifiedSentinelMaster,
  AddRedisDatabaseStatus,
} from 'uiSrc/slices/interfaces'
import { ApiStatusCode } from 'uiSrc/constants'

export const DbColumn = (
  handleChangedInput: (name: string, value: string) => void,
): ColumnDef<ModifiedSentinelMaster> => {
  return {
    header: 'Database Index',
    id: 'db',
    accessorKey: 'db',
    size: 140,
    cell: ({
      row: {
        original: { db, id, loading = false, status, error },
      },
    }) => {
      if (status === AddRedisDatabaseStatus.Success) {
        return db || <i>not assigned</i>
      }
      const isDBInvalid =
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        error.statusCode === ApiStatusCode.BadRequest
      return (
        <div role="presentation" style={{ position: 'relative' }}>
          <InputFieldSentinel
            min={0}
            disabled={loading}
            value={`${db}` || '0'}
            name={`db-${id}`}
            isInvalid={isDBInvalid}
            placeholder="Enter Index"
            inputType={SentinelInputFieldType.Number}
            onChangedInput={handleChangedInput}
          />
        </div>
      )
    },
  }
}
