import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'

import type { UsernameCellProps } from './UsernameCell.types'

export const UsernameCell = ({
  username,
  id,
  handleChangedInput,
}: UsernameCellProps) => (
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
