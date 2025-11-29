import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'

import type { UsernameCellRendererProps } from './UsernameCell.types'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { getMetaProps } from 'uiSrc/pages/autodiscover-sentinel/sentinel-databases/components/utils'
import { HandleChangedInputProps } from '../types'

export const UsernameCellRenderer = ({
  username,
  id,
  handleChangedInput,
}: UsernameCellRendererProps) => (
  <div role="presentation">
    <InputFieldSentinel
      value={username}
      name={`username-${id}`}
      placeholder="Enter Username"
      inputType={SentinelInputFieldType.Text}
      onChangedInput={handleChangedInput}
    />
  </div>
)

export const UsernameCell = ({
  row,
  column,
}: CellContext<ModifiedSentinelMaster, unknown>) => {
  const { username, id } = row.original
  const { handleChangedInput } = getMetaProps<HandleChangedInputProps>(column)
  return (
    <UsernameCellRenderer
      username={username!}
      id={id!}
      handleChangedInput={handleChangedInput}
    />
  )
}
