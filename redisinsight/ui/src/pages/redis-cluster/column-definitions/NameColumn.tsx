import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import styles from 'uiSrc/pages/redis-cluster/styles.module.scss'
import { formatLongName } from 'uiSrc/utils'
import { Text } from 'uiSrc/components/base/text'

export const NameColumn = (): ColumnDef<InstanceRedisCluster> => {
  return {
    header: 'Database',
    id: 'name',
    accessorKey: 'name',
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
            position="bottom"
            title="Database"
            className={styles.tooltipColumnName}
            content={formatLongName(name)}
          >
            <Text>{cellContent}</Text>
          </RiTooltip>
        </div>
      )
    },
  }
}
