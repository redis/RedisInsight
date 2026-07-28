import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
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
import { useTranslation } from 'uiSrc/i18n'
import { BulkDeleteFooterContainer } from './BulkDeleteFooter.styles'

export interface Props {
  onCancel: () => void
}

const BulkDeleteFooter = (props: Props) => {
  const { onCancel } = props
  const { t } = useTranslation()
  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { scanned, total } = useAppSelector(keysDataSelector)
  const { loading, generateReport, filter, search } = useAppSelector(
    bulkActionsDeleteSelector,
  )
  const { name, host, port } = useAppSelector(connectedInstanceSelector)
  const { status } = useAppSelector(bulkActionsDeleteOverviewSelector) ?? {}
  const { environment } = useDatabaseEnvironment()
  const isProduction = environment === Environment.Production
  // Fall back to host:port when name is empty so the modal never matches an
  // empty input (which would bypass the type-to-confirm safety check).
  const confirmationText = name || `${host}:${port}`

  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)
  const [isTypeToConfirmOpen, setIsTypeToConfirmOpen] = useState<boolean>(false)

  const dispatch = useAppDispatch()

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
            label={t('browser.bulkActions.delete.downloadReport')}
            data-testid="download-report-checkbox"
          />

          <RiTooltip
            content={t('browser.bulkActions.delete.downloadReportTooltip')}
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
            {isProcessedBulkAction(status)
              ? t('browser.bulkActions.button.close')
              : t('browser.bulkActions.button.cancel')}
          </SecondaryButton>
        )}
        {loading && (
          <SecondaryButton
            onClick={handleStop}
            data-testid="bulk-action-stop-btn"
          >
            {t('browser.bulkActions.button.stop')}
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
                {t('browser.bulkActions.button.delete')}
              </PrimaryButton>
            }
            title={t('browser.bulkActions.confirmTitle')}
            message={t('browser.bulkActions.delete.confirmMessage')}
            appendInfo={
              <Row align="center" gap="m">
                <RiIcon size="xl" type="ToastDangerIcon" />
                <Text size="s">
                  {t('browser.bulkActions.delete.confirmWarning')}
                </Text>
              </Row>
            }
            confirmButton={
              <DestructiveButton
                size="s"
                onClick={handleDelete}
                data-testid="bulk-action-apply-btn"
              >
                {t('browser.bulkActions.button.delete')}
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
              {t('browser.bulkActions.button.delete')}
            </PrimaryButton>
            {isTypeToConfirmOpen && (
              <TypeToConfirmModal
                title={t('browser.bulkActions.delete.typeToConfirmTitle')}
                confirmationText={confirmationText}
                confirmButtonText={t('browser.bulkActions.button.delete')}
                cancelButtonText={t('browser.bulkActions.button.cancel')}
                actionDescription={t(
                  'browser.bulkActions.delete.typeToConfirmDescription',
                )}
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
            {t('browser.bulkActions.button.startNew')}
          </PrimaryButton>
        )}
      </BulkDeleteFooterContainer>
    </Col>
  )
}

export default BulkDeleteFooter
