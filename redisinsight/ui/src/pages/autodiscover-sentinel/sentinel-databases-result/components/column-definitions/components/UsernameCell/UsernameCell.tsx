import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { AddRedisDatabaseStatus } from 'uiSrc/slices/interfaces'
import { useTranslation } from 'uiSrc/i18n'

import type { UsernameCellProps } from './UsernameCell.types'

export const UsernameCell = ({
  username,
  id,
  loading = false,
  error,
  status,
  handleChangedInput,
  isInvalid,
  errorNotAuth,
}: UsernameCellProps) => {
  const { t } = useTranslation()

  if (
    errorNotAuth(error, status) ||
    status === AddRedisDatabaseStatus.Success
  ) {
    return username ? (
      <span>{username}</span>
    ) : (
      <i>{t('autodiscover.sentinel.cell.usernameDefault')}</i>
    )
  }
  return (
    <div role="presentation" style={{ position: 'relative' }}>
      <InputFieldSentinel
        isText
        isInvalid={isInvalid}
        value={username}
        name={`username-${id}`}
        placeholder={t('autodiscover.sentinel.cell.usernamePlaceholder')}
        disabled={loading}
        inputType={SentinelInputFieldType.Text}
        onChangedInput={handleChangedInput}
      />
    </div>
  )
}
