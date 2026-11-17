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
    <Text>
      <ColorText variant="semiBold">{t('cluster.summary.label')}</ColorText>
      {countSuccessAdded ? (
        <span>
          {t('cluster.summary.success', { count: countSuccessAdded })}
          {countFailAdded ? '. ' : '.'}
        </span>
      ) : null}
      {countFailAdded ? (
        <span>{t('cluster.summary.fail', { count: countFailAdded })}</span>
      ) : null}
    </Text>
  )
}
