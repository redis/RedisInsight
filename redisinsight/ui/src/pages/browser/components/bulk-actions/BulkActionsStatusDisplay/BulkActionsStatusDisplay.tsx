import React from 'react'
import { isUndefined } from 'lodash'

import { BulkActionsStatus } from 'uiSrc/constants'
import { getApproximatePercentage, Maybe } from 'uiSrc/utils'
import { ColorText } from 'uiSrc/components/base/text'

import { isProcessedBulkAction } from '../utils'
import { Props } from '../BulkActionsInfo/BulkActionsInfo'
import { Banner } from 'uiSrc/components/base/display'

export interface BulkActionsStatusDisplayProps {
  status: Props['status']
  total: Maybe<number>
  scanned: Maybe<number>
}

export const BulkActionsStatusDisplay = ({
  status,
  total,
  scanned,
}: BulkActionsStatusDisplayProps) => {
  if (!isUndefined(status) && !isProcessedBulkAction(status)) {
    return (
      <Banner
        message={
          <>
            In progress:
            <ColorText size="XS">{` ${getApproximatePercentage(total, scanned)}`}</ColorText>
          </>
        }
        data-testid="bulk-status-progress"
      />
    )
  }

  if (status === BulkActionsStatus.Aborted) {
    return (
      <Banner
        variant="danger"
        message={<>Stopped: {getApproximatePercentage(total, scanned)}</>}
        data-testid="bulk-status-stopped"
      />
    )
  }

  if (status === BulkActionsStatus.Completed) {
    return (
      <Banner
        showIcon
        variant="success"
        message="Action completed"
        data-testid="bulk-status-completed"
      />
    )
  }

  if (status === BulkActionsStatus.Disconnected) {
    return (
      <Banner
        variant="danger"
        message={`Connection Lost: ${getApproximatePercentage(total, scanned)}`}
        data-testid="bulk-status-disconnected"
      />
    )
  }

  return null
}

export default BulkActionsStatusDisplay
