import React from 'react'

import { formatLongName, replaceSpaces } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import { CellText } from 'uiSrc/components/auto-discover'
import styles from 'uiSrc/pages/autodiscover-cloud/redis-cloud-databases/styles.module.scss'

import { SubscriptionCellProps } from './SubscriptionCell.types'

export const SubscriptionCell = ({ name, className }: SubscriptionCellProps) => {
  const cellContent = replaceSpaces(name.substring(0, 200))

  return (
    <div role="presentation" className={className}>
      <RiTooltip
        delay={200}
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

