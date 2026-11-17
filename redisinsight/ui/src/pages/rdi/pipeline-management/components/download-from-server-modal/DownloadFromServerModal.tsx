import React, { useState } from 'react'
import { Button, Modal, TextButton } from '@redis-ui/components'
import { SaveIcon } from '@redis-ui/icons'
import { Download } from 'uiSrc/pages/rdi/instance/components'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  fetchRdiPipeline,
  rdiPipelineSelector,
} from 'uiSrc/slices/rdi/pipeline'
import { useParams } from 'react-router-dom'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { useTranslation } from 'uiSrc/i18n'

export interface Props {
  trigger?: React.ReactElement
  onClose?: () => void
}

const DownloadFromServerModal = (props: Props) => {
  const { t } = useTranslation()
  const { trigger, onClose } = props

  const { loading, data } = useAppSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const [isOpen, setIsOpen] = useState(false)

  const dispatch = useAppDispatch()

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
        <Modal.Content.Header title={t('rdi.pipeline.download.title')} />
        <Modal.Content.Body.Compose>
          {t('rdi.pipeline.download.body')}
        </Modal.Content.Body.Compose>
        <Modal.Content.Footer.Compose>
          <Download
            onClose={onClose}
            trigger={
              <TextButton>
                <Button.Icon icon={SaveIcon} />
                {t('rdi.pipeline.download.saveToFile')}
              </TextButton>
            }
          />
          <Modal.Content.Footer.Group>
            <SecondaryButton size="l" onClick={onClose}>
              {t('rdi.pipeline.download.cancel')}
            </SecondaryButton>
            <PrimaryButton
              size="l"
              onClick={handleDownloadFromServer}
              loading={loading}
              data-testid="upload-confirm-btn"
            >
              {t('rdi.pipeline.download.confirm')}
            </PrimaryButton>
          </Modal.Content.Footer.Group>
        </Modal.Content.Footer.Compose>
      </Modal.Content.Compose>
    </Modal.Compose>
  )
}

export default DownloadFromServerModal
