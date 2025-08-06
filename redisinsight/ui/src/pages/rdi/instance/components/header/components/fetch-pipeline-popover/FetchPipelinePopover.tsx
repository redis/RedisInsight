import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { RiText } from 'uiBase/text'
import { DownloadIcon } from 'uiBase/icons'
import { RiEmptyButton, RiPrimaryButton } from 'uiBase/forms'
import ConfirmationPopover from 'uiSrc/pages/rdi/components/confirmation-popover/ConfirmationPopover'
import {
  fetchRdiPipeline,
  rdiPipelineSelector,
} from 'uiSrc/slices/rdi/pipeline'
import { TelemetryEvent, sendEventTelemetry } from 'uiSrc/telemetry'
import Download from 'uiSrc/pages/rdi/instance/components/download/Download'

import styles from './styles.module.scss'

export interface Props {
  onClose?: () => void
}

const FetchPipelinePopover = ({ onClose }: Props) => {
  const { loading, data } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  const handleRefreshClick = () => {
    dispatch(
      fetchRdiPipeline(rdiInstanceId, () => {
        onClose?.()
      }),
    )
  }

  const handleRefreshWarning = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_FROM_SERVER_CLICKED,
      eventData: {
        id: rdiInstanceId,
        jobsNumber: data?.jobs?.length || 'none',
      },
    })
  }

  return (
    <ConfirmationPopover
      title="Download a pipeline from the server"
      body={
        <RiText size="s">
          When downloading a new pipeline from the server, it will overwrite the
          existing one displayed in Redis Insight.
        </RiText>
      }
      submitBtn={
        <RiPrimaryButton size="s" data-testid="upload-confirm-btn">
          Download from server
        </RiPrimaryButton>
      }
      onConfirm={handleRefreshClick}
      button={
        <RiEmptyButton
          color="text"
          size="small"
          className={styles.downloadBtn}
          icon={DownloadIcon}
          disabled={loading}
          aria-labelledby="Upload pipeline button"
          data-testid="upload-pipeline-btn"
        >
          Download from server
        </RiEmptyButton>
      }
      onButtonClick={handleRefreshWarning}
      appendAction={<Download />}
    />
  )
}

export default FetchPipelinePopover
