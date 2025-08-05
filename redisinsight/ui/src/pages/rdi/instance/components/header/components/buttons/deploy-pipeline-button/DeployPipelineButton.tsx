import cx from 'classnames'
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
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { OutsideClickDetector } from 'uiSrc/components/base/utils'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { RiRocketIcon } from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { RiPopover, RiTooltip } from 'uiSrc/components/base'
import { RiIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

export interface Props {
  loading: boolean
  disabled: boolean
  onReset: () => void
}

const DeployPipelineButton = ({ loading, disabled, onReset }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [resetPipeline, setResetPipeline] = useState(false)

  const { config, jobs, resetChecked } = useSelector(rdiPipelineSelector)

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
    setIsPopoverOpen(false)
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

  const handleClosePopover = () => {
    setIsPopoverOpen(false)
  }

  const handleClickDeploy = () => {
    setIsPopoverOpen(true)
  }

  const handleSelectReset = (reset: boolean) => {
    setResetPipeline(reset)
    dispatch(resetPipelineChecked(reset))
  }

  return (
    <OutsideClickDetector onOutsideClick={handleClosePopover}>
      <RiPopover
        closePopover={handleClosePopover}
        ownFocus
        initialFocus={false}
        className={styles.popoverAnchor}
        panelClassName={cx('popoverLikeTooltip', styles.popover)}
        anchorClassName={styles.popoverAnchor}
        anchorPosition="upLeft"
        isOpen={isPopoverOpen}
        panelPaddingSize="m"
        focusTrapProps={{
          scrollLock: true,
        }}
        button={
          <PrimaryButton
            size="s"
            onClick={handleClickDeploy}
            icon={RiRocketIcon}
            disabled={disabled}
            loading={loading}
            data-testid="deploy-rdi-pipeline"
          >
            Deploy Pipeline
          </PrimaryButton>
        }
      >
        <Title size="XS">Are you sure you want to deploy the pipeline?</Title>
        <Spacer size="s" />
        <Text size="s">
          When deployed, this local configuration will overwrite any existing
          pipeline.
        </Text>
        <Spacer size="s" />
        <Text size="s">
          After deployment, consider flushing the target Redis database and
          resetting the pipeline to ensure that all data is reprocessed.
        </Text>
        <Spacer size="s" />
        <div className={styles.checkbox}>
          <Checkbox
            id="resetPipeline"
            name="resetPipeline"
            label="Reset"
            className={cx(styles.resetPipelineCheckbox, {
              [styles.checked]: resetPipeline,
            })}
            checked={resetPipeline}
            onChange={(e) => handleSelectReset(e.target.checked)}
            data-testid="reset-pipeline-checkbox"
          />

          <RiTooltip content="The pipeline will take a new snapshot of the data and process it, then continue tracking changes.">
            <RiIcon
              type="InfoIcon"
              size="m"
              style={{ cursor: 'pointer' }}
              data-testid="reset-checkbox-info-icon"
            />
          </RiTooltip>
        </div>
        <Row gap="m" responsive justify="end">
          <FlexItem>
            <PrimaryButton
              size="s"
              color="secondary"
              className={styles.popoverBtn}
              onClick={handleDeployPipeline}
              data-testid="deploy-confirm-btn"
            >
              Deploy
            </PrimaryButton>
          </FlexItem>
        </Row>
      </RiPopover>
    </OutsideClickDetector>
  )
}

export default DeployPipelineButton
