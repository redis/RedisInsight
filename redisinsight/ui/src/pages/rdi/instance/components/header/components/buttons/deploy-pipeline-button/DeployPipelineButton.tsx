import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
import { Modal } from '@redis-ui/components'
import { UploadWarningBanner } from 'uiSrc/components/upload-warning/styles'

export interface Props {
  loading: boolean
  disabled: boolean
  onReset: () => void
}

const DeployPipelineButton = ({ loading, disabled, onReset }: Props) => {
  const [resetPipeline, setResetPipeline] = useState(false)

  const { config, jobs, resetChecked, isPipelineValid } =
    useSelector(rdiPipelineSelector)

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const dispatch = useDispatch()

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
    <>
      <Modal
        id="deploy-pipeline-modal"
        title="Are you sure you want to deploy the pipeline?"
        content={
          <Col gap="l">
            {!isPipelineValid && (
              <UploadWarningBanner
                message="Your RDI pipeline contains errors. Are you sure you want to continue?"
                show
                showIcon
                variant="attention"
              />
            )}
            <FlexItem>
              <Text>
                When deployed, this local configuration will overwrite any
                existing pipeline.
              </Text>
              <Text>
                After deployment, consider flushing the target Redis database
                and resetting the pipeline to ensure that all data is
                reprocessed.
              </Text>
            </FlexItem>
            <Row align="center">
              <Checkbox
                id="resetPipeline"
                name="resetPipeline"
                label="Reset"
                labelSize="M"
                checked={resetPipeline}
                onChange={(e) => handleSelectReset(e.target.checked)}
                data-testid="reset-pipeline-checkbox"
              />

              <RiTooltip content="The pipeline will take a new snapshot of the data and process it, then continue tracking changes.">
                <Icon icon={InfoIcon} data-testid="reset-checkbox-info-icon" />
              </RiTooltip>
            </Row>
          </Col>
        }
        primaryButtonText="Deploy"
        onPrimaryButtonClick={handleDeployPipeline}
      >
        <PrimaryButton
          icon={RocketIcon}
          disabled={disabled}
          loading={loading}
          data-testid="deploy-rdi-pipeline"
        >
          Deploy
        </PrimaryButton>
      </Modal>
    </>
  )
}

export default DeployPipelineButton
