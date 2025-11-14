import React from 'react'

import { formatLongName, replaceSpaces } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import { CellText } from 'uiSrc/components/auto-discover'
import styles from 'uiSrc/pages/autodiscover-cloud/redis-cloud-databases/styles.module.scss'

import { DatabaseCellProps } from './DatabaseCell.types'

export const DatabaseCell = ({ name, className }: DatabaseCellProps) => {
  const cellContent = replaceSpaces(name.substring(0, 200))

  return (
    <div role="presentation" data-testid={`db_name_${name}`} className={className}>
      <RiTooltip
        delay={200}
        position="bottom"
        title="Database"
        className={styles.tooltipColumnName}
        anchorClassName="truncateText"
        content={formatLongName(name)}
      >
        <CellText>{cellContent}</CellText>
      </RiTooltip>
    </div>
  )
}

