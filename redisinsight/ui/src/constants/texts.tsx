import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

// Shared across several key-detail tables; migrate to i18n with those areas.
export const NoResultsFoundText = (
  <Text size="m" data-testid="no-result-found-only">
    No results found.
  </Text>
)

export const lastDeliveredIDTooltipText = (
  <>
    <Text size="s">
      Specify the ID of the last delivered entry in the stream from the new
      group's perspective.
    </Text>
    <Spacer size="xs" />
    <Text size="s">
      Otherwise, <b>$</b> represents the ID of the last entry in the
      stream,&nbsp;
      <b>0</b> fetches the entire stream from the beginning.
    </Text>
  </>
)

export const streamIDTooltipText = (
  <>
    ID must be a timestamp and sequence number greater than the last ID.
    <Spacer size="xs" />
    Otherwise, type * to auto-generate ID based on the database current time.
  </>
)
