import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { formatLongName, replaceSpaces } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import { CellText } from 'uiSrc/components/auto-discover'
import styles from 'uiSrc/pages/autodiscover-cloud/redis-cloud-databases-result/styles.module.scss'

export const DatabaseResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Database',
    id: 'name',
    accessorKey: 'name',
    enableSorting: true,
    maxSize: 120,
    cell: function InstanceCell({
      row: {
        original: { name },
      },
    }) {
      const cellContent = replaceSpaces(name.substring(0, 200))
      return (
        <div role="presentation" data-testid={`db_name_${name}`}>
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
    },
  }
}
