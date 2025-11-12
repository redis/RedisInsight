import React from 'react'

import styled from 'styled-components'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { millisecondsFormat } from 'uiSrc/utils'
import { BulkActionsType } from 'uiSrc/constants'
import { Text } from 'uiSrc/components/base/text'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'

export interface Props {
  type?: BulkActionsType
  processed?: number
  succeed?: number
  failed?: number
  duration?: number
  'data-testid': string
}

const SummaryContainer = styled(Row)`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral300};
  padding: ${({ theme }) => theme.core.space.space200}
    ${({ theme }) => theme.core.space.space600};
  border-radius: ${({ theme }) => theme.core.space.space050};
`
const SummaryValue = styled(Text)`
  line-height: 24px;
  font-weight: 500 !important;
`

const BulkActionSummary = ({
  type = BulkActionsType.Delete,
  processed = 0,
  succeed = 0,
  failed = 0,
  duration = 0,
  'data-testid': testId,
}: Props) => (
  <Col gap="xxl">
    <Text color="primary" size="m" variant="semiBold">
      Results
    </Text>
    <SummaryContainer data-testid={testId} gap="xl">
      <FlexItem grow>
        <SummaryValue color="primary" size="L">
          {numberWithSpaces(processed)}
        </SummaryValue>
        <SummaryValue color="secondary" size="s">
          {type === BulkActionsType.Delete ? 'Keys' : 'Commands'} Processed
        </SummaryValue>
      </FlexItem>
      <FlexItem grow>
        <SummaryValue color="primary" size="L">
          {numberWithSpaces(succeed)}
        </SummaryValue>
        <SummaryValue color="secondary" size="s">
          Success
        </SummaryValue>
      </FlexItem>
      <FlexItem grow>
        <SummaryValue color="primary" size="L">
          {numberWithSpaces(failed)}
        </SummaryValue>
        <SummaryValue color="secondary" size="s">
          Errors
        </SummaryValue>
      </FlexItem>
      <FlexItem grow>
        <SummaryValue color="primary" size="L">
          {millisecondsFormat(duration, 'H:mm:ss.SSS')}
        </SummaryValue>
        <SummaryValue color="secondary" size="s">
          Time Taken
        </SummaryValue>
      </FlexItem>
    </SummaryContainer>
  </Col>
)

export default BulkActionSummary
