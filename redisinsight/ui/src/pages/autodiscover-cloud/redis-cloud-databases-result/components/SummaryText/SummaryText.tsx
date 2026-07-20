import React from 'react'

import { ColorText, Text } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'
import type { SummaryTextProps } from './SummaryText.types'

export const SummaryText = ({
  countSuccessAdded,
  countFailAdded,
}: SummaryTextProps) => {
  const { t } = useTranslation()

  return (
    <Text size="M">
      <ColorText variant="semiBold">
        {t('autodiscover.cloud.summary.prefix')}
      </ColorText>{' '}
      {countSuccessAdded ? (
        <span>
          {t('autodiscover.cloud.summary.databasesSuccess', {
            count: countSuccessAdded,
          })}
          {countFailAdded ? '. ' : '.'}
        </span>
      ) : null}
      {countFailAdded ? (
        <span>
          {t('autodiscover.cloud.summary.databasesFail', {
            count: countFailAdded,
          })}
          .
        </span>
      ) : null}
    </Text>
  )
}
