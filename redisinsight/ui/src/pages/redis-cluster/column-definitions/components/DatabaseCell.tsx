import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { formatLongName } from 'uiSrc/utils'
import { CellText } from 'uiSrc/components/auto-discover'

import styles from '../../styles.module.scss'

export interface DatabaseCellProps {
  name: string
}

export const DatabaseCell = ({ name }: DatabaseCellProps) => {
  const cellContent = (name || '')
    .substring(0, 200)
    .replace(/\s\s/g, '\u00a0\u00a0')

  return (
    <div role="presentation" data-testid={`db_name_${name}`}>
      <RiTooltip
        position="bottom"
        title="Database"
        className={styles.tooltipColumnName}
        anchorClassName="truncateText"
        content={formatLongName(name || '')}
      >
        <CellText>{cellContent}</CellText>
      </RiTooltip>
    </div>
  )
}
