import React from 'react'
import { CellText } from 'uiSrc/components/auto-discover'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'

import type { AliasCellProps } from './AliasCell.types'

export const AliasCell = ({
  id = '',
  alias,
  error,
  loading = false,
  status,
  handleChangedInput,
  errorNotAuth,
}: AliasCellProps) => {
  if (errorNotAuth(error, status)) {
    return <CellText>{alias}</CellText>
  }
  return (
    <InputFieldSentinel
      name={`alias-${id}`}
      value={alias}
      placeholder="Database"
      disabled={loading}
      inputType={SentinelInputFieldType.Text}
      onChangedInput={handleChangedInput}
      maxLength={500}
    />
  )
}
