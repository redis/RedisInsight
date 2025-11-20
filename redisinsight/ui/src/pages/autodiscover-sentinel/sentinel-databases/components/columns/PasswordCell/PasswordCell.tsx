import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'

import type { PasswordCellProps } from './PasswordCell.types'
import { ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { getMetaAction } from '../../utils'

export const PasswordCellRenderer = ({
  password,
  id,
  handleChangedInput,
}: PasswordCellProps) => (
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
  const handleChangedInput = getMetaAction(column) as (
    name: string,
    value: string,
  ) => void
  return (
    <PasswordCellRenderer
      password={password}
      id={id!}
      handleChangedInput={handleChangedInput}
    />
  )
}
