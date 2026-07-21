import React from 'react'
import { CellText } from 'uiSrc/components/auto-discover'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { useTranslation } from 'uiSrc/i18n'

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
  const { t } = useTranslation()

  if (errorNotAuth(error, status)) {
    return <CellText>{alias}</CellText>
  }
  return (
    <InputFieldSentinel
      name={`alias-${id}`}
      value={alias}
      placeholder={t('autodiscover.sentinel.cell.aliasResultPlaceholder')}
      disabled={loading}
      inputType={SentinelInputFieldType.Text}
      onChangedInput={handleChangedInput}
      maxLength={500}
    />
  )
}
