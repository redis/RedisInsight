import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { ApiStatusCode } from 'uiSrc/constants'
import {
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'

import type { DbCellRendererProps } from './DbCell.types'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { HandleChangedInputProps } from 'uiSrc/pages/autodiscover-sentinel/components/columns/types'
import { getMetaProps } from 'uiSrc/utils/column'

export const DbCellRenderer = ({
  db,
  id = '',
  loading = false,
  status,
  error,
  handleChangedInput,
}: DbCellRendererProps) => {
  if (status === AddRedisDatabaseStatus.Success) {
    return db !== undefined ? <span>{db}</span> : <i>not assigned</i>
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
}

export const DbCell = ({
  row,
  column,
}: CellContext<ModifiedSentinelMaster, unknown>) => {
  const { db, id, loading = false, status, error } = row.original
  const { handleChangedInput } = getMetaProps<HandleChangedInputProps>(column)
  return (
    <DbCellRenderer
      db={db}
      id={id}
      loading={loading}
      status={status}
      error={error}
      handleChangedInput={handleChangedInput}
    />
  )
}
