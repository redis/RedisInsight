import React from 'react'
import { useTheme } from '@redis-ui/styles'
import { useTranslation } from 'uiSrc/i18n'
import { DurationUnits } from 'uiSrc/constants'
import { Title } from 'uiSrc/components/base/text/Title'
import { convertNumberByUnits } from 'uiSrc/pages/slow-log/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'
import NoQueryResultsIcon from 'uiSrc/assets/img/vector-search/no-query-results.svg'
import NoQueryResultsIconDark from 'uiSrc/assets/img/vector-search/no-query-results-dark.svg'

import { StyledImage } from './EmptySlowLog.styles'

export interface Props {
  durationUnit: DurationUnits
  slowlogLogSlowerThan: number
}

const EmptySlowLog = (props: Props) => {
  const { durationUnit, slowlogLogSlowerThan } = props
  const { t } = useTranslation()
  const theme = useTheme()
  const icon =
    theme.name === 'dark' ? NoQueryResultsIconDark : NoQueryResultsIcon

  const value = numberWithSpaces(
    convertNumberByUnits(slowlogLogSlowerThan, durationUnit),
  )
  const unit =
    durationUnit === DurationUnits.milliSeconds
      ? t('analytics.units.msec')
      : t('analytics.units.microseconds')

  return (
    <Col justify="center" grow data-testid="empty-slow-log">
      <Col align="center" justify="center" gap="xxl">
        <StyledImage
          as="img"
          src={icon}
          alt={t('analytics.slowLog.empty.imageAlt')}
        />
        <Col align="center" gap="m" grow={false}>
          <Title size="M" color="primary">
            {t('analytics.slowLog.empty.title')}
          </Title>
          <Text color="primary">
            {t('analytics.slowLog.empty.description', { value, unit })}
          </Text>
        </Col>
      </Col>
    </Col>
  )
}

export default EmptySlowLog
