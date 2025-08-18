import cx from 'classnames'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { RiColorText, RiText, RiTitle } from 'uiBase/text'
import { RiFlexItem, RiRow } from 'uiBase/layout'
import { RiSpacer } from 'uiBase/layout/spacer'
import { RiOutsideClickDetector } from 'uiBase/utils'
import { RiPrimaryButton, RiCheckbox } from 'uiBase/forms'
import { RiRocketIcon, RiIcon } from 'uiBase/icons'
import { RiPopover, RiTooltip } from 'uiBase/display'
import { rdiErrorMessages } from 'uiSrc/pages/rdi/constants'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { createAxiosError, pipelineToJson } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  deployPipelineAction,
  getPipelineStatusAction,
  rdiPipelineSelector,
  resetPipelineChecked,
} from 'uiSrc/slices/rdi/pipeline'
import styles from './styles.module.scss'

export interface Props {
  loading: boolean
  disabled: boolean
  onReset: () => void
}

const DeployPipelineButton = ({ loading, disabled, onReset }: Props) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
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
    <RiOutsideClickDetector onOutsideClick={handleClosePopover}>
      <RiPopover
        closePopover={handleClosePopover}
        ownFocus
        panelClassName={cx('popoverLikeTooltip', styles.popover)}
        anchorClassName={styles.popoverAnchor}
        anchorPosition="upLeft"
        isOpen={isPopoverOpen}
        panelPaddingSize="m"
        button={
          <RiPrimaryButton
            size="s"
            onClick={handleClickDeploy}
            icon={RiRocketIcon}
            disabled={disabled}
            loading={loading}
            data-testid="deploy-rdi-pipeline"
          >
            Deploy Pipeline
          </RiPrimaryButton>
        }
      >
        <RiTitle size="XS">
          {isPipelineValid ? (
            <RiColorText color="default">
              Are you sure you want to deploy the pipeline?
            </RiColorText>
          ) : (
            <RiColorText color="warning">
              <RiIcon type="ToastDangerIcon" size="L" color="attention500" />
              Your RDI pipeline contains errors. Are you sure you want to
              continue?
            </RiColorText>
          )}
        </RiTitle>
        <RiSpacer size="s" />
        <RiText size="s">
          When deployed, this local configuration will overwrite any existing
          pipeline.
        </RiText>
        <RiSpacer size="s" />
        <RiText size="s">
          After deployment, consider flushing the target Redis database and
          resetting the pipeline to ensure that all data is reprocessed.
        </RiText>
        <RiSpacer size="s" />
        <div className={styles.checkbox}>
          <RiCheckbox
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
        <RiRow gap="m" responsive justify="end">
          <RiFlexItem>
            <RiPrimaryButton
              size="s"
              color="secondary"
              className={styles.popoverBtn}
              onClick={handleDeployPipeline}
              data-testid="deploy-confirm-btn"
            >
              Deploy
            </RiPrimaryButton>
          </RiFlexItem>
        </RiRow>
      </RiPopover>
    </RiOutsideClickDetector>
  )
}

export default DeployPipelineButton
