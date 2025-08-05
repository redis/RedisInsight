import React from 'react'

import styled from 'styled-components'
import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { millisecondsFormat } from 'uiSrc/utils'
import { BulkActionsType } from 'uiSrc/constants'
import { Text } from 'uiSrc/components/base/text'
import { RiFlexItem, RiRow } from 'uiSrc/components/base/layout'

export interface Props {
  type?: BulkActionsType
  processed?: number
  succeed?: number
  failed?: number
  duration?: number
  'data-testid': string
}

const SummaryContainer = styled(RiRow)`
  padding-top: 18px;
`
const SummaryValue = styled(Text)`
  font-size: 18px !important;
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
  <SummaryContainer data-testid={testId} gap="xl">
    <RiFlexItem>
      <SummaryValue>{numberWithSpaces(processed)}</SummaryValue>
      <SummaryValue color="subdued">
        {type === BulkActionsType.Delete ? 'Keys' : 'Commands'} Processed
      </SummaryValue>
    </RiFlexItem>
    <RiFlexItem>
      <SummaryValue>{numberWithSpaces(succeed)}</SummaryValue>
      <SummaryValue color="subdued">Success</SummaryValue>
    </RiFlexItem>
    <RiFlexItem>
      <SummaryValue>{numberWithSpaces(failed)}</SummaryValue>
      <SummaryValue color="subdued">Errors</SummaryValue>
    </RiFlexItem>
    <RiFlexItem>
      <SummaryValue>{millisecondsFormat(duration, 'H:mm:ss.SSS')}</SummaryValue>
      <SummaryValue color="subdued">Time Taken</SummaryValue>
    </RiFlexItem>
  </SummaryContainer>
)

export default BulkActionSummary
