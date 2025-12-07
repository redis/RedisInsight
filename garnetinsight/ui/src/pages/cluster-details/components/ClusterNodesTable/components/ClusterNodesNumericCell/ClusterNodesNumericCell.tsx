import React from 'react'

import { numberWithSpaces } from 'uiSrc/utils/numbers'
import { RiTooltip } from 'uiSrc/components'
import { Text } from 'uiSrc/components/base/text'
import { ClusterNodesTableCell } from 'uiSrc/pages/cluster-details/components/ClusterNodesTable/ClusterNodesTable.types'

import { isMaxColumnFieldValue } from './utils/isMaxColumnFieldValue'
import {
  displayValueFormatter,
  tooltipContentFormatter,
} from './utils/formatters'

export const ClusterNodesNumericCell: ClusterNodesTableCell = ({
  row,
  column,
  table,
}) => {
  const item = row.original
  const field = column.id as keyof typeof item
  const value = item[field] ?? 0

  if (typeof value !== 'number') {
    return null
  }

  const data = table.options.data
  const isMax = isMaxColumnFieldValue(field, value, data)

  const displayValue = (displayValueFormatter[field] ?? numberWithSpaces)(value)
  const tooltipContent = tooltipContentFormatter[field]?.(value)

  return (
    <RiTooltip content={tooltipContent} data-testid={`${field}-tooltip`}>
      <Text
        variant={isMax ? 'semiBold' : 'regular'}
        data-testid={`${field}-value${isMax ? '-max' : ''}`}
      >
        {displayValue}
      </Text>
    </RiTooltip>
  )
}
