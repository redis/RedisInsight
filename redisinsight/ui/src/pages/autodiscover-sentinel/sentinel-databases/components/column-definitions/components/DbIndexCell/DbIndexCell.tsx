import React from 'react'
import { InputFieldSentinel, RiTooltip } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { RiIcon } from 'uiSrc/components/base/icons'
import { useTranslation } from 'uiSrc/i18n'

import type { DbIndexCellProps } from './DbIndexCell.types'

export const DbIndexCell = ({
  db = 0,
  id,
  handleChangedInput,
}: DbIndexCellProps) => {
  const { t } = useTranslation()

  return (
    <div role="presentation">
      <InputFieldSentinel
        min={0}
        value={`${db}` || '0'}
        name={`db-${id}`}
        placeholder={t('autodiscover.sentinel.cell.indexPlaceholder')}
        inputType={SentinelInputFieldType.Number}
        onChangedInput={handleChangedInput}
        append={
          <RiTooltip
            anchorClassName="inputAppendIcon"
            position="left"
            content={t('autodiscover.sentinel.cell.dbIndexTooltip')}
          >
            <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
          </RiTooltip>
        }
      />
    </div>
  )
}
