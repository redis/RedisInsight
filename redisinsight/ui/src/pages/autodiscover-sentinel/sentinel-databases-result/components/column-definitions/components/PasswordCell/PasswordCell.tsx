import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'
import { useTranslation } from 'uiSrc/i18n'

import type { PasswordCellProps } from './PasswordCell.types'

export const PasswordCell = ({
  password = '',
  id = '',
  error,
  loading = false,
  status,
  handleChangedInput,
  isInvalid,
  errorNotAuth,
}: PasswordCellProps) => {
  const { t } = useTranslation()

  if (
    errorNotAuth(error, status) ||
    status === AddRedisDatabaseStatus.Success
  ) {
    return password ? (
      <span>************</span>
    ) : (
      <i>{t('autodiscover.sentinel.cell.notAssigned')}</i>
    )
  }
  return (
    <div role="presentation" style={{ position: 'relative' }}>
      <InputFieldSentinel
        isInvalid={isInvalid}
        value={password}
        name={`password-${id}`}
        placeholder={t('autodiscover.sentinel.cell.passwordPlaceholder')}
        disabled={loading}
        inputType={SentinelInputFieldType.Password}
        onChangedInput={handleChangedInput}
      />
    </div>
  )
}
