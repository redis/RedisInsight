import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'

import type { PasswordCellProps } from './PasswordCell.types'

export const PasswordCell = ({
  password = '',
  id = '',
  error,
  loading = false,
  status,
  handleChangedInput,
  isInvalid,
  errorNotAuth,
}: PasswordCellProps) => {
  if (
    errorNotAuth(error, status) ||
    status === AddRedisDatabaseStatus.Success
  ) {
    return password ? <span>************</span> : <i>not assigned</i>
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
}
