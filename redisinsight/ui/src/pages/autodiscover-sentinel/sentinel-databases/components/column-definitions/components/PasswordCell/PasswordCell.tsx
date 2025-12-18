import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'

import type { PasswordCellProps } from './PasswordCell.types'

export const PasswordCell = ({
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
