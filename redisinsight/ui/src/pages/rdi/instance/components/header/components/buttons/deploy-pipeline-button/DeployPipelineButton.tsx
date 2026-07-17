import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useParams } from 'react-router-dom'

import {
  deployPipelineAction,
  getPipelineStatusAction,
  rdiPipelineSelector,
  resetPipelineChecked,
} from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { createAxiosError, pipelineToJson } from 'uiSrc/utils'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { rdiErrorMessages } from 'uiSrc/pages/rdi/constants'
import { Text } from 'uiSrc/components/base/text'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Icon, RocketIcon, InfoIcon } from 'uiSrc/components/base/icons'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { RiTooltip } from 'uiSrc/components/base'
import { Modal } from 'uiSrc/components/base/display/modal'
import { UploadWarningBanner } from 'uiSrc/components/upload-warning/styles'
import { useTranslation } from 'uiSrc/i18n'

export interface Props {
  loading?: boolean
  disabled: boolean
  onReset: () => void
}

const DeployPipelineButton = ({ loading, disabled, onReset }: Props) => {
  const { t } = useTranslation()
  const [resetPipeline, setResetPipeline] = useState(false)

  const { config, jobs, resetChecked, isPipelineValid } =
    useAppSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const dispatch = useAppDispatch()

  const updatePipelineStatus = () => {
    if (resetChecked) {
      dispatch(resetPipelineChecked(false))
      onReset?.()
    } else {
      dispatch(getPipelineStatusAction(rdiInstanceId))
    }
  }

  const handleDeployPipeline = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_DEPLOY_CLICKED,
      eventData: {
        id: rdiInstanceId,
        reset: resetPipeline,
        jobsNumber: jobs?.length,
      },
    })
    setResetPipeline(false)
    const JSONValues = pipelineToJson({ config, jobs }, (errors) => {
      dispatch(
        addErrorNotification(
          createAxiosError({
            message: rdiErrorMessages.invalidStructure(
              errors[0].filename,
              errors[0].msg,
            ),
          }),
        ),
      )
    })
    if (!JSONValues) {
      return
    }
    dispatch(
      deployPipelineAction(
        rdiInstanceId,
        JSONValues,
        updatePipelineStatus,
        () => dispatch(getPipelineStatusAction(rdiInstanceId)),
      ),
    )
  }

  const handleSelectReset = (reset: boolean) => {
    setResetPipeline(reset)
    dispatch(resetPipelineChecked(reset))
  }

  return (
    <Modal
      id="deploy-pipeline-modal"
      title={t('rdi.instance.deploy.confirmTitle')}
      content={
        <Col gap="l">
          {!isPipelineValid && (
            <UploadWarningBanner
              message={t('rdi.instance.deploy.errorsWarning')}
              show
              showIcon
              variant="attention"
            />
          )}
          <FlexItem>
            <Text>{t('rdi.instance.deploy.overwriteText')}</Text>
            <Text>{t('rdi.instance.deploy.flushText')}</Text>
          </FlexItem>
          <Row align="center">
            <Checkbox
              id="resetPipeline"
              name="resetPipeline"
              label={t('rdi.instance.deploy.resetLabel')}
              labelSize="M"
              checked={resetPipeline}
              onChange={(e) => handleSelectReset(e.target.checked)}
              data-testid="reset-pipeline-checkbox"
            />

            <RiTooltip content={t('rdi.instance.deploy.resetInfo')}>
              <Icon icon={InfoIcon} data-testid="reset-checkbox-info-icon" />
            </RiTooltip>
          </Row>
        </Col>
      }
      primaryButtonText={t('rdi.instance.deploy.button')}
      onPrimaryButtonClick={handleDeployPipeline}
    >
      <PrimaryButton
        icon={RocketIcon}
        disabled={disabled}
        loading={loading}
        data-testid="deploy-rdi-pipeline"
      >
        {t('rdi.instance.deploy.button')}
      </PrimaryButton>
    </Modal>
  )
}

export default DeployPipelineButton
