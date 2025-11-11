import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { formatLongName } from 'uiSrc/utils'
import { CellText } from 'uiSrc/components/auto-discover'

import styles from '../styles.module.scss'

export const DatabaseColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: 'Database',
    id: 'name',
    accessorKey: 'name',
    minSize: 180,
    enableSorting: true,
    cell: ({
      row: {
        original: { name },
      },
    }) => {
      const cellContent = name
        .substring(0, 200)
        .replace(/\s\s/g, '\u00a0\u00a0')
      return (
        <div role="presentation" data-testid={`db_name_${name}`}>
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
    },
  }
}
