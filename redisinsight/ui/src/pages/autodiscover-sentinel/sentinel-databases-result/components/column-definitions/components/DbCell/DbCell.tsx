import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { ApiStatusCode } from 'uiSrc/constants'
import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

import type { DbCellProps } from './DbCell.types'

export const DbCell = ({
  db,
  id = '',
  loading = false,
  status,
  error,
  handleChangedInput,
}: DbCellProps) => {
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
