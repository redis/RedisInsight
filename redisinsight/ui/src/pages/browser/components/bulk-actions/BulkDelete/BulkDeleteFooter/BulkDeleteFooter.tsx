import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  bulkActionsDeleteOverviewSelector,
  setBulkDeleteStartAgain,
  toggleBulkDeleteActionTriggered,
  setBulkDeleteDownloadLog,
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
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { RefreshIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import BulkDeleteContent from '../BulkDeleteContent'
import { isProcessedBulkAction } from '../../utils'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { ConfirmationPopover, RiTooltip } from 'uiSrc/components'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'

import { BulkDeleteFooterContainer } from './BulkDeleteFooter.styles'

export interface Props {
  onCancel: () => void
}

const BulkDeleteFooter = (props: Props) => {
  const { onCancel } = props
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { filter, search } = useSelector(keysSelector)
  const { scanned, total } = useSelector(keysDataSelector)
  const { loading, downloadLog } = useSelector(bulkActionsDeleteSelector)
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
    <Col data-testid="bulk-actions-delete" justify="end">
      {status && <BulkDeleteContent />}

      <BulkDeleteFooterContainer
        align="center"
        justify="end"
        gap="l"
        grow={false}
      >
        <Row grow={false}>
          <Checkbox
            checked={downloadLog}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch(setBulkDeleteDownloadLog(e.target.checked))
            }
            label="Download report"
            data-testid="download-report-checkbox"
          />

          <RiTooltip
            content="Download a detailed report of deleted keys. Disable to improve performance for large datasets."
            position="left"
          >
            <RiIcon
              type="InfoIcon"
              // TODO: fixes for the icon positioning
              style={{ display: 'flex', alignItems: 'center' }}
            />
          </RiTooltip>
        </Row>

        {!loading && (
          <SecondaryButton
            onClick={handleCancel}
            data-testid="bulk-action-cancel-btn"
          >
            {isProcessedBulkAction(status) ? 'Close' : 'Cancel'}
          </SecondaryButton>
        )}
        {loading && (
          <SecondaryButton
            onClick={handleStop}
            data-testid="bulk-action-stop-btn"
          >
            Stop
          </SecondaryButton>
        )}

        {!isProcessedBulkAction(status) && (
          <ConfirmationPopover
            anchorPosition="upCenter"
            ownFocus
            isOpen={isPopoverOpen}
            closePopover={() => setIsPopoverOpen(false)}
            panelPaddingSize="m"
            anchorClassName="deleteFieldPopover"
            button={
              <PrimaryButton
                loading={loading}
                disabled={loading}
                onClick={handleDeleteWarning}
                data-testid="bulk-action-warning-btn"
              >
                Delete
              </PrimaryButton>
            }
            title={'Are you sure you want to perform this action?'}
            message={
              'This will delete all keys matching the selected type and pattern.'
            }
            appendInfo={
              <Row align="center" gap="m">
                <RiIcon size="xl" type="ToastDangerIcon" />
                <Text size="s">
                  Bulk deletion may impact performance and cause memory spikes.
                  Avoid running in production.
                </Text>
              </Row>
            }
            confirmButton={
              <DestructiveButton
                size="s"
                onClick={handleDelete}
                data-testid="bulk-action-apply-btn"
              >
                Delete
              </DestructiveButton>
            }
          />
        )}
        {isProcessedBulkAction(status) && (
          <PrimaryButton
            icon={RefreshIcon}
            onClick={handleStartNew}
            data-testid="bulk-action-start-again-btn"
          >
            Start New
          </PrimaryButton>
        )}
      </BulkDeleteFooterContainer>
    </Col>
  )
}

export default BulkDeleteFooter
