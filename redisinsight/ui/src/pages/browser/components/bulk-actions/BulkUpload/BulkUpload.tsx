import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { Nullable } from 'uiSrc/utils'
import { BulkActionsStatus, BulkActionsType } from 'uiSrc/constants'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  bulkActionsUploadOverviewSelector,
  bulkActionsUploadSelector,
  bulkActionsUploadSummarySelector,
  bulkUploadDataAction,
  setBulkUploadStartAgain,
  uploadController,
} from 'uiSrc/slices/browser/bulkActions'

import BulkActionsInfo from 'uiSrc/pages/browser/components/bulk-actions/BulkActionsInfo'
import BulkActionSummary from 'uiSrc/pages/browser/components/bulk-actions/BulkActionSummary'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { isProcessedBulkAction } from 'uiSrc/pages/browser/components/bulk-actions/utils'
import {
  RiFilePicker,
  UploadWarning,
  RiPopover,
  RiTooltip,
} from 'uiSrc/components'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { RefreshIcon } from 'uiSrc/components/base/icons'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { useTranslation } from 'uiSrc/i18n'
import {
  StyledContent,
  StyledFooter,
  StyledPopoverContainer,
  StyledPopoverIcon,
  StyledPopoverText,
} from './BulkUpload.styles'

export interface Props {
  onCancel: () => void
}

const MAX_MB_FILE = 3_000
const MAX_FILE_SIZE = MAX_MB_FILE * 1024 * 1024

const BulkUpload = (props: Props) => {
  const { onCancel } = props
  const { t } = useTranslation()
  const { id: instanceId } = useAppSelector(connectedInstanceSelector)
  const { loading, fileName } = useAppSelector(bulkActionsUploadSelector)
  const { status, progress, duration } =
    useAppSelector(bulkActionsUploadOverviewSelector) ?? {}
  const { succeed, processed, failed } =
    useAppSelector(bulkActionsUploadSummarySelector) ?? {}

  const [files, setFiles] = useState<Nullable<FileList>>(null)
  const [isInvalid, setIsInvalid] = useState<boolean>(false)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const isCompleted = status && status === BulkActionsStatus.Completed

  const dispatch = useAppDispatch()

  const onStartAgain = () => {
    dispatch(setBulkUploadStartAgain())
    setFiles(null)
    setIsSubmitDisabled(true)
  }

  const handleUploadWarning = () => {
    setIsPopoverOpen(true)
    sendEventTelemetry({
      event: TelemetryEvent.BULK_ACTIONS_WARNING,
      eventData: {
        databaseId: instanceId,
        action: BulkActionsType.Upload,
      },
    })
  }

  const onFileChange = (files: Nullable<FileList>) => {
    const isOutOfSize = (files?.[0]?.size || 0) > MAX_FILE_SIZE

    setFiles(files)
    setIsInvalid(!!files?.length && isOutOfSize)
    setIsSubmitDisabled(!files?.length || isOutOfSize)
  }

  const handleUpload = () => {
    if (files) {
      setIsPopoverOpen(false)

      const formData = new FormData()
      formData.append('file', files[0])
      dispatch(
        bulkUploadDataAction(instanceId, {
          file: formData,
          fileName: files[0].name,
        }),
      )
    }
  }

  const handleClickCancel = () => {
    uploadController?.abort()
    onCancel?.()
  }

  return (
    <Col justify="between" data-testid="bulk-upload-container">
      {!isCompleted ? (
        <StyledContent gap="l" align="start">
          <Row align="start" grow={false}>
            <Text color="primary">
              {t('browser.bulkActions.upload.instruction')}
            </Text>
            <RiTooltip
              content={
                <>
                  <Text size="xs">SET Key0 Value0</Text>
                  <Text size="xs">SET Key1 Value1</Text>
                  <Text size="xs">...</Text>
                  <Text size="xs">SET KeyN ValueN</Text>
                </>
              }
              data-testid="bulk-upload-tooltip-example"
            >
              <RiIcon
                type="InfoIcon"
                style={{
                  marginLeft: 4,
                  marginBottom: 2,
                }}
              />
            </RiTooltip>
          </Row>
          <RiFilePicker
            id="bulk-upload-file-input"
            initialPromptText={t('browser.bulkActions.upload.promptText')}
            isInvalid={isInvalid}
            onChange={onFileChange}
            display="large"
            data-testid="bulk-upload-file-input"
            aria-label={t('browser.bulkActions.upload.promptAria')}
          />
          {isInvalid && (
            <ColorText color="danger" data-testid="input-file-error-msg">
              {t('browser.bulkActions.upload.fileSizeError', {
                max: MAX_MB_FILE,
              })}
            </ColorText>
          )}
          <UploadWarning />
        </StyledContent>
      ) : (
        <BulkActionsInfo
          loading={loading}
          status={status}
          progress={progress}
          title={t('browser.bulkActions.upload.executedTitle')}
          subTitle={<div className="truncateText">{fileName}</div>}
        >
          <BulkActionSummary
            type={BulkActionsType.Upload}
            succeed={succeed}
            processed={processed}
            failed={failed}
            duration={duration}
            data-testid="bulk-upload-completed-summary"
          />
        </BulkActionsInfo>
      )}

      <StyledFooter gap="l" justify="end" grow={false}>
        <SecondaryButton
          onClick={handleClickCancel}
          data-testid="bulk-action-cancel-btn"
        >
          {isProcessedBulkAction(status)
            ? t('browser.bulkActions.button.close')
            : t('browser.bulkActions.button.cancel')}
        </SecondaryButton>
        {!isCompleted ? (
          <RiPopover
            id="bulk-upload-warning-popover"
            anchorPosition="upCenter"
            isOpen={isPopoverOpen}
            closePopover={() => setIsPopoverOpen(false)}
            panelPaddingSize="none"
            button={
              <PrimaryButton
                onClick={handleUploadWarning}
                disabled={isSubmitDisabled || loading}
                loading={loading}
                data-testid="bulk-action-warning-btn"
              >
                {t('browser.bulkActions.button.upload')}
              </PrimaryButton>
            }
          >
            <StyledPopoverContainer gap="m">
              <Col data-testid="bulk-action-tooltip" gap="s">
                <StyledPopoverIcon type="ToastDangerIcon" />
                <StyledPopoverText size="L" color="primary">
                  {t('browser.bulkActions.confirmTitle')}
                </StyledPopoverText>
                <StyledPopoverText size="M" color="secondary">
                  {t('browser.bulkActions.upload.confirmMessage')}
                </StyledPopoverText>
              </Col>
              <Row justify="end">
                <PrimaryButton
                  size="s"
                  onClick={handleUpload}
                  data-testid="bulk-action-apply-btn"
                >
                  {t('browser.bulkActions.button.upload')}
                </PrimaryButton>
              </Row>
            </StyledPopoverContainer>
          </RiPopover>
        ) : (
          <PrimaryButton
            icon={RefreshIcon}
            color="secondary"
            onClick={onStartAgain}
            data-testid="bulk-action-start-new-btn"
          >
            {t('browser.bulkActions.button.startNew')}
          </PrimaryButton>
        )}
      </StyledFooter>
    </Col>
  )
}

export default BulkUpload
