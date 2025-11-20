import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'

import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { getMetaProps } from 'uiSrc/utils/column'
import type { HandleChangedInputProps } from '../types'
import type { PasswordCellRendererProps } from './PasswordCell.types'

export const PasswordCellRenderer = ({
  password,
  id,
  handleChangedInput,
}: PasswordCellRendererProps) => (
  <div role="presentation">
    <InputFieldSentinel
      value={password}
      name={`password-${id}`}
      placeholder="Enter Password"
      inputType={SentinelInputFieldType.Password}
      onChangedInput={handleChangedInput}
    />
  </div>
)

export const PasswordCell = ({
  row,
  column,
}: CellContext<ModifiedSentinelMaster, unknown>) => {
  const { password, id } = row.original
  const { handleChangedInput } = getMetaProps<HandleChangedInputProps>(column)
  return (
    <PasswordCellRenderer
      password={password}
      id={id!}
      handleChangedInput={handleChangedInput}
    />
  )
}
