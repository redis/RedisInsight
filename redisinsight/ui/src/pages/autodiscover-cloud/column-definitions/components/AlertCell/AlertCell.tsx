import React from 'react'

import { RedisCloudSubscriptionStatus } from 'uiSrc/slices/interfaces'
import { RiIcon } from 'uiSrc/components/base/icons'
import { CellText } from 'uiSrc/components/auto-discover'
import { AlertStatusContent } from 'uiSrc/pages/autodiscover-cloud/components/AlertStatusContent'
import { StatusTooltip } from 'uiSrc/pages/autodiscover-cloud/column-definitions/ColumnDefinitions.styles'

import { AlertCellProps } from './AlertCell.types'

export const AlertCell = ({ status, numberOfDatabases }: AlertCellProps) => {
  const isUnavailable =
    status !== RedisCloudSubscriptionStatus.Active || numberOfDatabases === 0

  if (isUnavailable) {
    return (
      <StatusTooltip
        title={
          <CellText variant="semiBold">
            This subscription is not available for one of the following reasons:
          </CellText>
        }
        content={<AlertStatusContent />}
        position="right"
      >
        <RiIcon
          type="ToastDangerIcon"
          color="danger500"
          size="m"
          aria-label="subscription alert"
        />
      </StatusTooltip>
    )
  }

  return <RiIcon type="CheckBoldIcon" color="success500" size="m" />
}
