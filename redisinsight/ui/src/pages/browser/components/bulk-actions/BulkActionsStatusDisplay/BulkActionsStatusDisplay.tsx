import React from 'react'
import { isUndefined } from 'lodash'

import { BulkActionsStatus } from 'uiSrc/constants'
import { getApproximatePercentage, Maybe } from 'uiSrc/utils'
import { ColorText } from 'uiSrc/components/base/text'
import { useTranslation } from 'uiSrc/i18n'

import { isProcessedBulkAction } from '../utils'
import { Props } from '../BulkActionsInfo/BulkActionsInfo'
import { Banner } from 'uiSrc/components/base/display'

export interface BulkActionsStatusDisplayProps {
  status: Props['status']
  total: Maybe<number>
  scanned: Maybe<number>
  error?: string
}

export const BulkActionsStatusDisplay = ({
  status,
  total,
  scanned,
  error,
}: BulkActionsStatusDisplayProps) => {
  const { t } = useTranslation()
  if (!isUndefined(status) && !isProcessedBulkAction(status)) {
    return (
      <Banner
        message={
          <>
            {t('browser.bulkActions.status.inProgress')}
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
        message={t('browser.bulkActions.status.stopped', {
          percentage: getApproximatePercentage(total, scanned),
        })}
        data-testid="bulk-status-stopped"
      />
    )
  }

  if (status === BulkActionsStatus.Completed) {
    return (
      <Banner
        showIcon
        variant="success"
        message={t('browser.bulkActions.status.completed')}
        data-testid="bulk-status-completed"
      />
    )
  }

  if (status === BulkActionsStatus.Failed) {
    return (
      <Banner
        variant="danger"
        message={error || t('browser.bulkActions.status.failed')}
        data-testid="bulk-status-failed"
      />
    )
  }

  if (status === BulkActionsStatus.Disconnected) {
    return (
      <Banner
        variant="danger"
        message={t('browser.bulkActions.status.disconnected', {
          percentage: getApproximatePercentage(total, scanned),
        })}
        data-testid="bulk-status-disconnected"
      />
    )
  }

  return null
}

export default BulkActionsStatusDisplay
