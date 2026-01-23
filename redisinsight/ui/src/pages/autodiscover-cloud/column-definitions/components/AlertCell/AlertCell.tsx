import React from 'react'

import { RiTooltip } from 'uiSrc/components'
import { RedisCloudSubscriptionStatus } from 'uiSrc/slices/interfaces'
import { RiIcon } from 'uiSrc/components/base/icons'
import { CellText } from 'uiSrc/components/auto-discover'
import { AlertStatusContent } from 'uiSrc/pages/autodiscover-cloud/components/AlertStatusContent'
import styles from 'uiSrc/pages/autodiscover-cloud/redis-cloud-subscriptions/styles.module.scss'

import { AlertCellProps } from './AlertCell.types'

export const AlertCell = ({ status, numberOfDatabases }: AlertCellProps) => {
  const isUnavailable =
    status !== RedisCloudSubscriptionStatus.Active || numberOfDatabases === 0

  if (isUnavailable) {
    return (
      <RiTooltip
        title={
          <CellText variant="semiBold">
            This subscription is not available for one of the following reasons:
          </CellText>
        }
        content={<AlertStatusContent />}
        position="right"
        className={styles.tooltipStatus}
      >
        <RiIcon
          type="ToastDangerIcon"
          color="danger500"
          size="m"
          aria-label="subscription alert"
        />
      </RiTooltip>
    )
  }

  return <RiIcon type="CheckBoldIcon" color="success500" size="m" />
}
