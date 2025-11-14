import { formatLongName, replaceSpaces } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import styles from 'uiSrc/pages/autodiscover-cloud/redis-cloud-databases/styles.module.scss'
import { CellText } from 'uiSrc/components/auto-discover'
import React from 'react'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'

export const databaseColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Database',
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    maxSize: 150,
    cell: ({
      row: {
        original: { name },
      },
    }) => {
      const cellContent = replaceSpaces(name.substring(0, 200))
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
