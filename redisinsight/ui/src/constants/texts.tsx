import React from 'react'
import { RiText } from 'uiBase/text'
import { RiSpacer } from 'uiBase/layout/spacer'

export const NoResultsFoundText = (
  <RiText size="m" data-testid="no-result-found-only">
    No results found.
  </RiText>
)

export const LoadingText = (
  <RiText size="m" data-testid="loading-keys" style={{ lineHeight: 1.4 }}>
    loading...
  </RiText>
)

export const NoSelectedIndexText = (
  <RiText size="m" data-testid="no-result-select-index">
    Select an index and enter a query to search per values of keys.
  </RiText>
)

export const FullScanNoResultsFoundText = (
  <>
    <RiText size="m" data-test-subj="no-result-found">
      No results found.
    </RiText>
    <RiSpacer size="m" />
    <RiText size="s" data-test-subj="search-advices">
      Check the spelling.
      <br />
      Check upper and lower cases.
      <br />
      Use an asterisk (*) in your request for more generic results.
    </RiText>
  </>
)
export const ScanNoResultsFoundText = (
  <>
    <RiText size="m" data-testid="scan-no-results-found">
      No results found.
    </RiText>
    <br />
    <RiText size="s">
      Use &quot;Scan more&quot; button to proceed or filter per exact Key Name
      to scan more efficiently.
    </RiText>
  </>
)

export const lastDeliveredIDTooltipText = (
  <>
    Specify the ID of the last delivered entry in the stream from the new
    group's perspective.
    <RiSpacer size="xs" />
    Otherwise, <b>$</b> represents the ID of the last entry in the stream,&nbsp;
    <b>0</b> fetches the entire stream from the beginning.
  </>
)
