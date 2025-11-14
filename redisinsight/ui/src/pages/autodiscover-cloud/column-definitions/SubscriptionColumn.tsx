import React from 'react'
import { RiTooltip } from 'uiSrc/components'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'
import styles from 'uiSrc/pages/redis-cluster/styles.module.scss'
import { formatLongName, replaceSpaces } from 'uiSrc/utils'
import { CellText } from 'uiSrc/components/auto-discover'

export const subscriptionColumn = (): ColumnDef<RedisCloudSubscription> => {
  return {
    id: 'name',
    accessorKey: 'name',
    header: 'Subscription',
    enableSorting: true,
    cell: function InstanceCell({
      row: {
        original: { name },
      },
    }) {
      const cellContent = replaceSpaces(name.substring(0, 200))
      return (
        <div role="presentation">
          <RiTooltip
            position="bottom"
            title="Subscription"
            delay={200}
            className={styles.tooltipColumnName}
            content={formatLongName(name)}
          >
            <CellText>{cellContent}</CellText>
          </RiTooltip>
        </div>
      )
    },
  }
}
