import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'

import type { AliasCellProps } from './AliasCell.types'

export const AliasCell = ({
  id,
  alias,
  name,
  handleChangedInput,
}: AliasCellProps) => (
  <div role="presentation">
    <InputFieldSentinel
      name={`alias-${id}`}
      value={alias || name}
      placeholder="Enter Database Alias"
      inputType={SentinelInputFieldType.Text}
      onChangedInput={handleChangedInput}
      maxLength={500}
    />
  </div>
)
