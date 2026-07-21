import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { useTranslation } from 'uiSrc/i18n'

import type { UsernameCellProps } from './UsernameCell.types'

export const UsernameCell = ({
  username,
  id,
  handleChangedInput,
}: UsernameCellProps) => {
  const { t } = useTranslation()

  return (
    <div role="presentation">
      <InputFieldSentinel
        value={username}
        name={`username-${id}`}
        placeholder={t('autodiscover.sentinel.cell.usernamePlaceholder')}
        inputType={SentinelInputFieldType.Text}
        onChangedInput={handleChangedInput}
      />
    </div>
  )
}
