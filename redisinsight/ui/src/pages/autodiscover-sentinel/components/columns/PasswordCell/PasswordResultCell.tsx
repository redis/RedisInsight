import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import {
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'

import type { PasswordResultCellRendererProps } from './PasswordResultCell.types'
import { errorNotAuth, getMetaProps } from 'uiSrc/utils/column'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { HandleChangedInputProps } from 'uiSrc/pages/autodiscover-sentinel/components/columns/types'

export const PasswordCellRenderer = ({
  password = '',
  id = '',
  error,
  loading = false,
  status,
  handleChangedInput,
  isInvalid,
}: PasswordResultCellRendererProps) => {
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

export const PasswordResultCell = ({
  row,
  column,
}: CellContext<ModifiedSentinelMaster, unknown>) => {
  const { password, id, error, loading = false, status } = row.original
  const { handleChangedInput, isInvalid } = getMetaProps<
    HandleChangedInputProps & { isInvalid: boolean }
  >(column)
  return (
    <PasswordCellRenderer
      password={password}
      id={id}
      error={error}
      loading={loading}
      status={status}
      handleChangedInput={handleChangedInput}
      isInvalid={isInvalid}
    />
  )
}
