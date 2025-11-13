import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import cx from 'classnames'
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
import {
  StyledContent,
  StyledFooter,
  StyledPopoverContainer,
  StyledPopoverIcon,
  StyledPopoverText,
} from './BulkUpload.styles'
import styles from './styles.module.scss'

export interface Props {
  onCancel: () => void
}

const MAX_MB_FILE = 3_000
const MAX_FILE_SIZE = MAX_MB_FILE * 1024 * 1024

const BulkUpload = (props: Props) => {
  const { onCancel } = props
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { loading, fileName } = useSelector(bulkActionsUploadSelector)
  const { status, progress, duration } =
    useSelector(bulkActionsUploadOverviewSelector) ?? {}
  const { succeed, processed, failed } =
    useSelector(bulkActionsUploadSummarySelector) ?? {}

  const [files, setFiles] = useState<Nullable<FileList>>(null)
  const [isInvalid, setIsInvalid] = useState<boolean>(false)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false)

  const isCompleted = status && status === BulkActionsStatus.Completed

  const dispatch = useDispatch()

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
              Upload the text file with the list of Redis commands
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
            initialPromptText="Select or drag and drop a file"
            isInvalid={isInvalid}
            onChange={onFileChange}
            display="large"
            data-testid="bulk-upload-file-input"
            aria-label="Select or drag and drop file"
          />
          {isInvalid && (
            <ColorText color="danger" data-testid="input-file-error-msg">
              File should not exceed {MAX_MB_FILE} MB
            </ColorText>
          )}
          <UploadWarning />
        </StyledContent>
      ) : (
        <BulkActionsInfo
          loading={loading}
          status={status}
          progress={progress}
          title="Commands executed from file"
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
          className={styles.cancelBtn}
          data-testid="bulk-action-cancel-btn"
        >
          {isProcessedBulkAction(status) ? 'Close' : 'Cancel'}
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
                Upload
              </PrimaryButton>
            }
          >
            <StyledPopoverContainer gap="m">
              <Col data-testid="bulk-action-tooltip" gap="s">
                <StyledPopoverIcon type="ToastDangerIcon" />
                <StyledPopoverText size="L" color="primary">
                  Are you sure you want to perform this action?
                </StyledPopoverText>
                <StyledPopoverText size="M" color="secondary">
                  All commands from the file will be executed against your
                  database.
                </StyledPopoverText>
              </Col>
              <Row justify="end">
                <PrimaryButton
                  size="s"
                  onClick={handleUpload}
                  data-testid="bulk-action-apply-btn"
                >
                  Upload
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
            Start New
          </PrimaryButton>
        )}
      </StyledFooter>
    </Col>
  )
}

export default BulkUpload
