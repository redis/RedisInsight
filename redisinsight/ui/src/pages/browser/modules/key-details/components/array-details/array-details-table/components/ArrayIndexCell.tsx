import React from 'react'

import { RiTooltip } from 'uiSrc/components/base/tooltip/RITooltip'
import { Text } from 'uiSrc/components/base/text'
import { formatLongName } from 'uiSrc/utils'

interface ArrayIndexCellProps {
  /** Decimal-string index (BigInt-as-string contract). */
  index: string
}

const TEST_ID_PREFIX = 'array-details-table-index'

/**
 * Renders an array slot's index with a tooltip showing the full value —
 * indexes can be up to 20 digits (2^64-1), which need truncation in the
 * cell but should remain copyable from the tooltip.
 */
export const ArrayIndexCell = ({ index }: ArrayIndexCellProps) => (
  <Text
    component="div"
    color="secondary"
    style={{ maxWidth: '100%' }}
    data-testid={`${TEST_ID_PREFIX}-${index}`}
  >
    <RiTooltip
      title="Index"
      position="bottom"
      anchorClassName="truncateText"
      content={formatLongName(index)}
    >
      <span className="truncateText">{index}</span>
    </RiTooltip>
  </Text>
)
