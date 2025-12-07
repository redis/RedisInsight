import React from 'react'
import { ColorText, Text } from 'uiSrc/components/base/text'

import { type SummaryTextProps } from './SummaryText.types'

export const SummaryText = ({
  countStatusActive,
  countStatusFailed,
}: SummaryTextProps) => (
  <Text size="M">
    <ColorText variant="semiBold">Summary: </ColorText>
    {countStatusActive ? (
      <span>
        Successfully discovered database(s) in {countStatusActive}
        &nbsp;
        {countStatusActive > 1 ? 'subscriptions' : 'subscription'}
        .&nbsp;
      </span>
    ) : null}

    {countStatusFailed ? (
      <span>
        Failed to discover database(s) in {countStatusFailed}
        &nbsp;
        {countStatusFailed > 1 ? 'subscriptions.' : ' subscription.'}
      </span>
    ) : null}
  </Text>
)

