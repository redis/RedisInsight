import React from 'react'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'

import { type SummaryTextProps } from './SummaryText.types'

export const SummaryText = ({
  countStatusActive,
  countStatusFailed,
}: SummaryTextProps) => {
  const { t } = useTranslation()

  return (
    <Text size="M">
      <ColorText variant="semiBold">
        {t('autodiscover.cloud.summary.prefix')}
      </ColorText>
      {countStatusActive ? (
        <span>
          {t('autodiscover.cloud.summary.subscriptionsSuccess', {
            count: countStatusActive,
          })}
          .&nbsp;
        </span>
      ) : null}

      {countStatusFailed ? (
        <span>
          {t('autodiscover.cloud.summary.subscriptionsFail', {
            count: countStatusFailed,
          })}
          .
        </span>
      ) : null}
    </Text>
  )
}
