import React from 'react'

import { formatLongName, replaceSpaces } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import { CellText } from 'uiSrc/components/auto-discover'
import styles from 'uiSrc/pages/autodiscover-cloud/redis-cloud-databases/styles.module.scss'
import { CellContext } from 'uiSrc/components/base/layout/table'
import { RedisCloudSubscription } from 'uiSrc/slices/interfaces'

import type { SubscriptionCellRendererProps } from './SubscriptionCell.types'

export const SubscriptionCellRenderer = ({
  name,
  className,
}: SubscriptionCellRendererProps) => {
  const cellContent = replaceSpaces(name.substring(0, 200))

  return (
    <div role="presentation" className={className}>
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
}

export const SubscriptionCell = ({
  row,
}: CellContext<RedisCloudSubscription, unknown>) => {
  const { name } = row.original
  return <SubscriptionCellRenderer name={name} />
}
