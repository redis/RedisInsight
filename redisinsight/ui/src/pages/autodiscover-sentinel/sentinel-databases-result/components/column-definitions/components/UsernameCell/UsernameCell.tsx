import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import {
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'

import type { UsernameCellRendererProps } from './UsernameCell.types'
import { errorNotAuth, getMetaProps } from 'uiSrc/utils/column'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { HandleChangedInputProps } from 'uiSrc/pages/autodiscover-sentinel/sentinel-databases/components/columns/types'

export const UsernameCellRenderer = ({
  username,
  id,
  loading = false,
  error,
  status,
  handleChangedInput,
  isInvalid,
}: UsernameCellRendererProps) => {
  if (
    errorNotAuth(error, status) ||
    status === AddRedisDatabaseStatus.Success
  ) {
    return username ? <span>{username}</span> : <i>Default</i>
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
}

export const UsernameCell = ({
  row,
  column,
}: CellContext<ModifiedSentinelMaster, unknown>) => {
  const { username, id, loading = false, error, status } = row.original
  const { handleChangedInput, isInvalid } = getMetaProps<
    HandleChangedInputProps & { isInvalid: boolean }
  >(column)
  return (
    <UsernameCellRenderer
      username={username}
      id={id}
      loading={loading}
      error={error}
      status={status}
      handleChangedInput={handleChangedInput}
      isInvalid={isInvalid}
    />
  )
}