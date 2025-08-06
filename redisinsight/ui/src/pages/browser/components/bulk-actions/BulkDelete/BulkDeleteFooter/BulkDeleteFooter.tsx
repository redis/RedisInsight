import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import {
  RiDestructiveButton,
  RiPrimaryButton,
  RiSecondaryButton,
} from 'uiBase/forms'
import { RefreshIcon, RiIcon } from 'uiBase/icons'
import { RiText } from 'uiBase/text'
import { RiPopover } from 'uiBase/index'
import {
  bulkActionsDeleteOverviewSelector,
  setBulkDeleteStartAgain,
  toggleBulkDeleteActionTriggered,
  bulkActionsDeleteSelector,
} from 'uiSrc/slices/browser/bulkActions'
import { keysDataSelector, keysSelector } from 'uiSrc/slices/browser/keys'
import {
  getMatchType,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { BulkActionsType } from 'uiSrc/constants'
import { getRangeForNumber, BULK_THRESHOLD_BREAKPOINTS } from 'uiSrc/utils'

import { DEFAULT_SEARCH_MATCH } from 'uiSrc/constants/api'
import BulkDeleteContent from '../BulkDeleteContent'
import { isProcessedBulkAction } from '../../utils'

import styles from './styles.module.scss'

export interface Props {
  onCancel: () => void
}

const BulkDeleteFooter = (props: Props) => {
  const { onCancel } = props
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { filter, search } = useSelector(keysSelector)
  const { scanned, total } = useSelector(keysDataSelector)
  const { loading } = useSelector(bulkActionsDeleteSelector)
  const { status } = useSelector(bulkActionsDeleteOverviewSelector) ?? {}

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const dispatch = useDispatch()

  const handleDelete = () => {
    setIsPopoverOpen(false)
    dispatch(toggleBulkDeleteActionTriggered())
  }

  const handleDeleteWarning = () => {
    setIsPopoverOpen(true)

    let matchValue = DEFAULT_SEARCH_MATCH
    if (search !== DEFAULT_SEARCH_MATCH && !!search) {
      matchValue = getMatchType(search)
    }

    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_WARNING,
      eventData: {
        filter: {
          match: matchValue,
          type: filter,
        },
        progress: {
          scanned,
          scannedRange: getRangeForNumber(scanned, BULK_THRESHOLD_BREAKPOINTS),
          total,
          totalRange: getRangeForNumber(total, BULK_THRESHOLD_BREAKPOINTS),
        },
        databaseId: instanceId,
        action: BulkActionsType.Delete,
      },
    })
  }

  const handleStartNew = () => {
    dispatch(setBulkDeleteStartAgain())
  }

  const handleStop = () => {
    dispatch(toggleBulkDeleteActionTriggered())
  }

  const handleCancel = () => {
    onCancel()
  }

  return (
    <div className={styles.container} data-testid="bulk-actions-delete">
      {status && <BulkDeleteContent />}
      <div className={styles.footer}>
        {!loading && (
          <RiSecondaryButton
            onClick={handleCancel}
            className={styles.cancelBtn}
            data-testid="bulk-action-cancel-btn"
          >
            {isProcessedBulkAction(status) ? 'Close' : 'Cancel'}
          </RiSecondaryButton>
        )}
        {loading && (
          <RiSecondaryButton
            onClick={handleStop}
            className={styles.cancelBtn}
            data-testid="bulk-action-stop-btn"
          >
            Stop
          </RiSecondaryButton>
        )}

        {!isProcessedBulkAction(status) && (
          <RiPopover
            id="bulk-delete-warning-popover"
            anchorPosition="upCenter"
            isOpen={isPopoverOpen}
            closePopover={() => setIsPopoverOpen(false)}
            panelClassName={styles.panelPopover}
            panelPaddingSize="none"
            button={
              <RiPrimaryButton
                loading={loading}
                disabled={loading}
                onClick={handleDeleteWarning}
                data-testid="bulk-action-warning-btn"
              >
                Delete
              </RiPrimaryButton>
            }
          >
            <RiText
              color="subdued"
              className={styles.containerPopover}
              data-testid="bulk-action-tooltip"
            >
              <RiIcon
                type="ToastDangerIcon"
                color="danger600"
                className={styles.popoverIcon}
              />
              <div className={cx(styles.popoverItem, styles.popoverItemTitle)}>
                Are you sure you want to perform this action?
              </div>
              <div className={styles.popoverItem}>
                {`All keys with ${filter ? filter?.toUpperCase() : 'all'} key type and selected pattern will be deleted.`}
              </div>
              <RiDestructiveButton
                size="s"
                className={styles.deleteApproveBtn}
                onClick={handleDelete}
                data-testid="bulk-action-apply-btn"
              >
                Delete
              </RiDestructiveButton>
            </RiText>
          </RiPopover>
        )}
        {isProcessedBulkAction(status) && (
          <RiPrimaryButton
            icon={RefreshIcon}
            onClick={handleStartNew}
            data-testid="bulk-action-start-again-btn"
          >
            Start New
          </RiPrimaryButton>
        )}
      </div>
    </div>
  )
}

export default BulkDeleteFooter
