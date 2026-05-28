import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Environment } from 'apiClient'

import {
  bulkActionsDeleteOverviewSelector,
  setBulkDeleteStartAgain,
  toggleBulkDeleteActionTriggered,
  setBulkDeleteGenerateReport,
  setBulkDeleteConfirmedThrough,
  bulkActionsDeleteSelector,
} from 'uiSrc/slices/browser/bulkActions'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { keysDataSelector } from 'uiSrc/slices/browser/keys'
import {
  getMatchType,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { BulkActionConfirmation, BulkActionsType } from 'uiSrc/constants'
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
import { useDatabaseEnvironment } from 'uiSrc/components/hooks/useDatabaseEnvironment'
import { TypeToConfirmModal } from 'uiSrc/components/type-to-confirm-modal'
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
  const { scanned, total } = useSelector(keysDataSelector)
  const { loading, generateReport, filter, search } = useSelector(
    bulkActionsDeleteSelector,
  )
  const { name, host, port } = useSelector(connectedInstanceSelector)
  const { status } = useSelector(bulkActionsDeleteOverviewSelector) ?? {}
  const { environment } = useDatabaseEnvironment()
  const isProduction = environment === Environment.Production
  // Fall back to host:port when name is empty so the modal never matches an
  // empty input (which would bypass the type-to-confirm safety check).
  const confirmationText = name || `${host}:${port}`

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)
  const [isTypeToConfirmOpen, setIsTypeToConfirmOpen] = useState<boolean>(false)

  const dispatch = useDispatch()

  const handleDelete = () => {
    setIsPopoverOpen(false)
    dispatch(toggleBulkDeleteActionTriggered())
  }

  const handleTypeToConfirm = () => {
    setIsTypeToConfirmOpen(false)
    dispatch(
      setBulkDeleteConfirmedThrough(BulkActionConfirmation.TypeToConfirm),
    )
    dispatch(toggleBulkDeleteActionTriggered())
  }

  const sendDeleteWarningTelemetry = () => {
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

  const handleDeleteWarning = () => {
    setIsPopoverOpen(true)
    sendDeleteWarningTelemetry()
  }

  const handleOpenTypeToConfirm = () => {
    setIsTypeToConfirmOpen(true)
    sendDeleteWarningTelemetry()
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
      <BulkDeleteFooterContainer
        align="center"
        justify="end"
        gap="l"
        grow={false}
      >
        <Row grow={false}>
          <Checkbox
            checked={generateReport}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              dispatch(setBulkDeleteGenerateReport(e.target.checked))
            }
            label="Download report"
            data-testid="download-report-checkbox"
          />

          <RiTooltip
            content="Download a detailed report of deleted keys."
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

        {!isProcessedBulkAction(status) && !isProduction && (
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
        {!isProcessedBulkAction(status) && isProduction && (
          <>
            <PrimaryButton
              loading={loading}
              disabled={loading}
              onClick={handleOpenTypeToConfirm}
              data-testid="bulk-action-warning-btn"
            >
              Delete
            </PrimaryButton>
            {isTypeToConfirmOpen && (
              <TypeToConfirmModal
                title="Delete all matching keys"
                confirmationText={confirmationText}
                confirmButtonText="Delete"
                actionDescription={
                  <>
                    This will delete all keys matching the selected type and
                    pattern. Bulk deletion may impact performance and cause
                    memory spikes.
                  </>
                }
                onConfirm={handleTypeToConfirm}
                onCancel={() => setIsTypeToConfirmOpen(false)}
              />
            )}
          </>
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
