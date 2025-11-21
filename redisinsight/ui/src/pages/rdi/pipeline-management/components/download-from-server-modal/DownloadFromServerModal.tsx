import React, { useState } from 'react'
import { Button, Modal, TextButton } from '@redis-ui/components'
import { SaveIcon } from '@redis-ui/icons'
import { Download } from 'uiSrc/pages/rdi/instance/components'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchRdiPipeline,
  rdiPipelineSelector,
} from 'uiSrc/slices/rdi/pipeline'
import { useParams } from 'react-router-dom'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

export interface Props {
  trigger?: React.ReactElement
  onClose?: () => void
}

const DownloadFromServerModal = (props: Props) => {
  const { trigger, onClose } = props

  const { loading, data } = useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const [isOpen, setIsOpen] = useState(false)

  const dispatch = useDispatch()

  const handleDownloadFromServer = () => {
    dispatch(
      fetchRdiPipeline(rdiInstanceId, () => {
        onClose?.()
      }),
    )
  }

  const onOpenChangeHandler = (open: boolean) => {
    if (!open) {
      onClose?.()
    }

    setIsOpen(open)
  }

  const handleTrigger = (e: React.MouseEvent) => {
    setIsOpen(true)
    trigger?.props?.onClick?.(e)
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_UPLOAD_FROM_SERVER_CLICKED,
      eventData: {
        id: rdiInstanceId,
        jobsNumber: data?.jobs?.length || 'none',
      },
    })
  }

  const button = trigger
    ? React.cloneElement(trigger, {
        disabled: loading,
        onClick: handleTrigger,
      })
    : null

  return (
    <Modal.Compose open={isOpen} onOpenChange={onOpenChangeHandler}>
      {button && <Modal.Trigger>{button}</Modal.Trigger>}
      <Modal.Content.Compose persistent>
        <Modal.Content.Close />
        <Modal.Content.Header title="Download a pipeline from the server" />
        <Modal.Content.Body.Compose>
          When downloading the pipeline configuration from the server, it will
          overwrite the existing one displayed in Redis Insight.
        </Modal.Content.Body.Compose>
        <Modal.Content.Footer.Compose>
          <Download
            onClose={onClose}
            trigger={
              <TextButton>
                <Button.Icon icon={SaveIcon} />
                Save to file
              </TextButton>
            }
          />
          <Modal.Content.Footer.Group>
            <SecondaryButton size="l" onClick={onClose}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              size="l"
              onClick={handleDownloadFromServer}
              loading={loading}
              data-testid="upload-confirm-btn"
            >
              Download from server
            </PrimaryButton>
          </Modal.Content.Footer.Group>
        </Modal.Content.Footer.Compose>
      </Modal.Content.Compose>
    </Modal.Compose>
  )
}

export default DownloadFromServerModal
