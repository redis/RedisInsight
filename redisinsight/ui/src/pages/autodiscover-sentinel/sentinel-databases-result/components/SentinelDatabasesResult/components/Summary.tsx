import React from 'react'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'
import { type SummaryTextProps } from './SummaryTextProps.types'

export const SummaryText = ({
  countSuccessAdded,
  countFailAdded,
}: SummaryTextProps) => {
  const { t } = useTranslation()

  return (
    <Text component="div" color="primary" data-testid="summary">
      <ColorText variant="semiBold" size="S">
        {t('autodiscover.sentinel.summary.prefix')}
      </ColorText>
      {countSuccessAdded ? (
        <ColorText size="S">
          {t('autodiscover.sentinel.summary.success', {
            count: countSuccessAdded,
          })}
          {countFailAdded ? '; ' : ' '}
        </ColorText>
      ) : null}
      {countFailAdded ? (
        <ColorText size="S">
          {t('autodiscover.sentinel.summary.fail', { count: countFailAdded })}
        </ColorText>
      ) : null}
    </Text>
  )
}
