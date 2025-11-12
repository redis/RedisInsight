import React from 'react'
import { DurationUnits } from 'uiSrc/constants'
import { Title } from 'uiSrc/components/base/text/Title'
import { convertNumberByUnits } from 'uiSrc/pages/slow-log/utils'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'
import NoQueryResultsIcon from 'uiSrc/assets/img/vector-search/no-query-results.svg'

import { StyledImage } from './EmptySlowLog.styles'

export interface Props {
  durationUnit: DurationUnits
  slowlogLogSlowerThan: number
}

const EmptySlowLog = (props: Props) => {
  const { durationUnit, slowlogLogSlowerThan } = props

  return (
    <Col justify="center" grow data-testid="empty-slow-log">
      <Col align="center" justify="center" gap="xxl">
        <StyledImage as="img" src={NoQueryResultsIcon} alt="No Slow Logs" />
        <Col align="center" gap="m" grow={false}>
          <Title size="M" color="primary">
            No Slow Logs found
          </Title>
          <Text color="primary">
            Either no commands exceeding&nbsp;
            {numberWithSpaces(
              convertNumberByUnits(slowlogLogSlowerThan, durationUnit),
            )}
            &nbsp;
            {durationUnit === DurationUnits.milliSeconds
              ? DurationUnits.mSeconds
              : DurationUnits.microSeconds}
            &nbsp;were found or Slow Log is disabled on the server.
          </Text>
        </Col>
      </Col>
    </Col>
  )
}

export default EmptySlowLog
