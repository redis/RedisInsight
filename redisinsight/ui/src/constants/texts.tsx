import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

export const NoResultsFoundText = (
  <Text size="m" data-testid="no-result-found-only">
    No results found.
  </Text>
)

export const LoadingText = (
  <Text size="m" data-testid="loading-keys" style={{ lineHeight: 1.4 }}>
    loading...
  </Text>
)

export const NoSelectedIndexText = (
  <Text size="m" data-testid="no-result-select-index">
    Select an index and enter a query to search per values of keys.
  </Text>
)

export const FullScanNoResultsFoundText = (
  <>
    <Text size="m" data-test-subj="no-result-found">
      No results found.
    </Text>
    <Spacer size="m" />
    <Text size="s" data-test-subj="search-advices">
      Check the spelling.
      <br />
      Check upper and lower cases.
      <br />
      Use an asterisk (*) in your request for more generic results.
    </Text>
  </>
)
export const ScanNoResultsFoundText = (
  <>
    <Text size="m" data-testid="scan-no-results-found">
      No results found.
    </Text>
    <br />
    <Text size="s">
      Use &quot;Scan more&quot; button to proceed or filter per exact Key Name
      to scan more efficiently.
    </Text>
  </>
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
