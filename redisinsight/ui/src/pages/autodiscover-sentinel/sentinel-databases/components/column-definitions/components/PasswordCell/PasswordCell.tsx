import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { useTranslation } from 'uiSrc/i18n'

import type { PasswordCellProps } from './PasswordCell.types'

export const PasswordCell = ({
  password,
  id,
  handleChangedInput,
}: PasswordCellProps) => {
  const { t } = useTranslation()

  return (
    <div role="presentation">
      <InputFieldSentinel
        value={password}
        name={`password-${id}`}
        placeholder={t('autodiscover.sentinel.cell.passwordPlaceholder')}
        inputType={SentinelInputFieldType.Password}
        onChangedInput={handleChangedInput}
      />
    </div>
  )
}
