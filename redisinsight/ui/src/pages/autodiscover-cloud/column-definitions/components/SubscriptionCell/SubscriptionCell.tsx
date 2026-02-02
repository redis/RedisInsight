import React from 'react'

import { formatLongName, replaceSpaces } from 'uiSrc/utils'
import { CellText } from 'uiSrc/components/auto-discover'
import { ColumnNameTooltip } from 'uiSrc/pages/autodiscover-cloud/column-definitions/ColumnDefinitions.styles'

import { SubscriptionCellProps } from './SubscriptionCell.types'

export const SubscriptionCell = ({
  name,
  className,
}: SubscriptionCellProps) => {
  const cellContent = replaceSpaces(name.substring(0, 200))

  return (
    <div role="presentation" className={className}>
      <ColumnNameTooltip
        position="bottom"
        title="Subscription"
        anchorClassName="truncateText"
        content={formatLongName(name)}
      >
        <CellText>{cellContent}</CellText>
      </ColumnNameTooltip>
    </div>
  )
}
