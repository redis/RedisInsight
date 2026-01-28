import React from 'react'

import { ColorText, Text } from 'uiSrc/components/base/text'
import type { SummaryTextProps } from './SummaryText.types'

export const SummaryText = ({
  countSuccessAdded,
  countFailAdded,
}: SummaryTextProps) => (
  <Text size="M">
    <ColorText variant="semiBold">Summary: </ColorText>{' '}
    {countSuccessAdded ? (
      <span>
        Successfully added {countSuccessAdded} database(s)
        {countFailAdded ? '. ' : '.'}
      </span>
    ) : null}
    {countFailAdded ? (
      <span>Failed to add {countFailAdded} database(s).</span>
    ) : null}
  </Text>
)
