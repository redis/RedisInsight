import React from 'react'

import { formatLongName, replaceSpaces } from 'uiSrc/utils'
import { RiTooltip } from 'uiSrc/components'
import { CellText } from 'uiSrc/components/auto-discover'
import { useTranslation } from 'uiSrc/i18n'
import styles from 'uiSrc/pages/autodiscover-cloud/redis-cloud-databases/styles.module.scss'

import { SubscriptionCellProps } from './SubscriptionCell.types'

export const SubscriptionCell = ({
  name,
  className,
}: SubscriptionCellProps) => {
  const { t } = useTranslation()
  const cellContent = replaceSpaces(name.substring(0, 200))

  return (
    <div role="presentation" className={className}>
      <RiTooltip
        position="bottom"
        title={t('autodiscover.cloud.column.subscription')}
        className={styles.tooltipColumnName}
        anchorClassName="truncateText"
        content={formatLongName(name)}
      >
        <CellText>{cellContent}</CellText>
      </RiTooltip>
    </div>
  )
}
