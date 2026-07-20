import React from 'react'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { useTranslation } from 'uiSrc/i18n'

import type { AliasCellProps } from './AliasCell.types'

export const AliasCell = ({
  id,
  alias,
  name,
  handleChangedInput,
}: AliasCellProps) => {
  const { t } = useTranslation()

  return (
    <div role="presentation">
      <InputFieldSentinel
        name={`alias-${id}`}
        value={alias || name}
        placeholder={t('autodiscover.sentinel.cell.aliasPlaceholder')}
        inputType={SentinelInputFieldType.Text}
        onChangedInput={handleChangedInput}
        maxLength={500}
      />
    </div>
  )
}
