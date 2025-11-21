import React from 'react'

import { formatLongName, replaceSpaces } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import { CellText } from 'uiSrc/components/auto-discover'
import styles from 'uiSrc/pages/autodiscover-cloud/redis-cloud-databases/styles.module.scss'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

import type { DatabaseCellRendererProps } from './DatabaseCell.types'

export const DatabaseCellRenderer = ({
  name,
  className,
}: DatabaseCellRendererProps) => {
  const cellContent = replaceSpaces(name.substring(0, 200))

  return (
    <div
      role="presentation"
      data-testid={`db_name_${name}`}
      className={className}
    >
      <RiTooltip
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

export const DatabaseCell = ({
  row,
}: CellContext<InstanceRedisCloud, unknown>) => {
  const { name } = row.original
  return <DatabaseCellRenderer name={name} />
}
