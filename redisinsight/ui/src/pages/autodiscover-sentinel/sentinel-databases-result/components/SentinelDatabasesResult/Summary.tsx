import { ColorText, Text } from 'uiSrc/components/base/text'
import React from 'react'

export const SummaryText = ({
  countSuccessAdded,
  countFailAdded,
}: {
  countSuccessAdded: number
  countFailAdded: number
}) => (
  <Text component="div" color="primary" data-testid="summary">
    <ColorText variant="semiBold" size="S">
      Summary:&nbsp;
    </ColorText>
    {countSuccessAdded ? (
      <ColorText size="S">
        Successfully added {countSuccessAdded}
        {' primary group(s)'}
        {countFailAdded ? '; ' : ' '}
      </ColorText>
    ) : null}
    {countFailAdded ? (
      <ColorText size="S">
        Failed to add {countFailAdded}
        {' primary group(s)'}
      </ColorText>
    ) : null}
  </Text>
)
