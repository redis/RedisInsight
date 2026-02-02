import React from 'react'

import { formatLongName, replaceSpaces } from 'uiSrc/utils'
import { CellText } from 'uiSrc/components/auto-discover'
import { ColumnNameTooltip } from 'uiSrc/pages/autodiscover-cloud/column-definitions/ColumnDefinitions.styles'

import { DatabaseCellProps } from './DatabaseCell.types'

export const DatabaseCell = ({ name, className }: DatabaseCellProps) => {
  const cellContent = replaceSpaces(name.substring(0, 200))

  return (
    <div
      role="presentation"
      data-testid={`db_name_${name}`}
      className={className}
    >
      <ColumnNameTooltip
        position="bottom"
        title="Database"
        anchorClassName="truncateText"
        content={formatLongName(name)}
      >
        <CellText>{cellContent}</CellText>
      </ColumnNameTooltip>
    </div>
  )
}
