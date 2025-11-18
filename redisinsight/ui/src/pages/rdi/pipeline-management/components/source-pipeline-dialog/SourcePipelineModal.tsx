import React, { useEffect, useState } from 'react'
import { keys } from '@elastic/eui'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  fetchRdiPipeline,
  rdiPipelineSelector,
  setChangedFile,
} from 'uiSrc/slices/rdi/pipeline'
import {
  appContextPipelineManagement,
  setPipelineDialogState,
} from 'uiSrc/slices/app/context'
import UploadModal from 'uiSrc/pages/rdi/pipeline-management/components/upload-modal/UploadModal'
import { Text, Title } from 'uiSrc/components/base/text'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import {
  ContractsIcon,
  DownloadIcon,
  UploadIcon,
} from 'uiSrc/components/base/icons'
import { FileChangeType } from 'uiSrc/slices/interfaces'
import { Modal } from 'uiSrc/components/base/display'
import { Spacer } from 'uiSrc/components/base/layout'

import { ButtonWrapper } from './SourcePipelineModal.styles'

export const EMPTY_PIPELINE = {
  config: '',
  jobs: [],
}

export enum PipelineSourceOptions {
  SERVER = 'download from server',
  FILE = 'upload from file',
  NEW = 'new pipeline',
}

const SourcePipelineDialog = () => {
  const [isShowDownloadDialog, setIsShowDownloadDialog] = useState(false)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const { isOpenDialog } = useSelector(appContextPipelineManagement)

  // data is original response from the server converted to config and jobs yaml strings
  // since by default it is null we can determine if it was fetched and it's content
  const { data } = useSelector(rdiPipelineSelector)

  useEffect(() => {
    if (data?.config === '') {
      dispatch(setPipelineDialogState(true))
    }
  }, [data])

  const dispatch = useDispatch()

  const onSelect = (option: PipelineSourceOptions) => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_START_OPTION_SELECTED,
      eventData: {
        id: rdiInstanceId,
        option,
      },
    })
  }

  const onLoadPipeline = () => {
    dispatch(fetchRdiPipeline(rdiInstanceId))
    onSelect(PipelineSourceOptions.SERVER)
    dispatch(setPipelineDialogState(false))
  }

  const onStartNewPipeline = () => {
    onSelect(PipelineSourceOptions.NEW)
    dispatch(setChangedFile({ name: 'config', status: FileChangeType.Added }))
    dispatch(setPipelineDialogState(false))
  }

  const handleCloseDialog = () => {
    dispatch(setChangedFile({ name: 'config', status: FileChangeType.Added }))
    dispatch(setPipelineDialogState(false))
  }

  const onUploadClick = () => {
    setIsShowDownloadDialog(true)
    onSelect(PipelineSourceOptions.FILE)
  }

  const onEnter = (
    event: React.KeyboardEvent<HTMLDivElement>,
    callback: () => void,
  ) => {
    if (event.key === keys.ENTER) callback()
  }

  if (isShowDownloadDialog) {
    return (
      <UploadModal
        onClose={() => dispatch(setPipelineDialogState(false))}
        visible={isShowDownloadDialog}
      />
    )
  }

  if (!isOpenDialog) {
    return null
  }

  return (
    <Modal.Compose open onOpenChange={(open) => !open && handleCloseDialog()}>
      <Modal.Content.Compose persistent>
        <Modal.Content.Body.Compose>
          <Spacer size="xl" />
          <Col gap="xxl">
            <Col align="center" justify="center">
              <Title size="L" color="primary">
                Select an option
              </Title>
              <Title size="L" color="primary">
                to start with your pipeline
              </Title>
            </Col>
            <Row gap="xxl">
              <ButtonWrapper
                gap="s"
                role="button"
                tabIndex={0}
                onKeyDown={(event) => onEnter(event, onLoadPipeline)}
                onClick={onLoadPipeline}
                data-testid="server-source-pipeline-dialog"
              >
                <DownloadIcon size="XL" />
                <Text color="primary" size="S" textAlign="center">
                  Download from server
                </Text>
              </ButtonWrapper>
              <ButtonWrapper
                gap="s"
                role="button"
                tabIndex={0}
                onKeyDown={(event) => onEnter(event, onUploadClick)}
                onClick={onUploadClick}
                data-testid="file-source-pipeline-dialog"
              >
                <UploadIcon size="XL" />
                <Text color="primary" size="S" textAlign="center">
                  Upload from file
                </Text>
              </ButtonWrapper>
              <ButtonWrapper
                gap="s"
                role="button"
                tabIndex={0}
                onKeyDown={(event) => onEnter(event, onStartNewPipeline)}
                onClick={onStartNewPipeline}
                data-testid="empty-source-pipeline-dialog"
              >
                <ContractsIcon size="XL" />
                <Text color="primary" size="S" textAlign="center">
                  Create new pipeline
                </Text>
              </ButtonWrapper>
            </Row>
          </Col>
          <Spacer size="xl" />
        </Modal.Content.Body.Compose>
      </Modal.Content.Compose>
    </Modal.Compose>
  )
}

export default SourcePipelineDialog
