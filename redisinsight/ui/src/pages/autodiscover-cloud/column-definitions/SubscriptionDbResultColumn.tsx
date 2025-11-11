import React from 'react'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import { InstanceRedisCloud } from 'uiSrc/slices/interfaces'
import { formatLongName, replaceSpaces } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import { CellText } from 'uiSrc/components/auto-discover'
import styles from 'uiSrc/pages/autodiscover-cloud/redis-cloud-databases-result/styles.module.scss'

export const SubscriptionDbResultColumn = (): ColumnDef<InstanceRedisCloud> => {
  return {
    header: 'Subscription',
    id: 'subscriptionName',
    accessorKey: 'subscriptionName',
    enableSorting: true,
    maxSize: 270,
    cell: function SubscriptionCell({
      row: {
        original: { subscriptionName: name },
      },
    }) {
      const cellContent = replaceSpaces(name.substring(0, 200))
      return (
        <div role="presentation">
          <RiTooltip
            position="bottom"
            title="Subscription"
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
