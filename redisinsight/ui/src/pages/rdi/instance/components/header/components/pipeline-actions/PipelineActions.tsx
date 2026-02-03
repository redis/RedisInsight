import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import styled from 'styled-components'
import {
  getPipelineStatusAction,
  rdiPipelineActionSelector,
  rdiPipelineSelector,
  resetPipelineAction,
  setConfigValidationErrors,
  setIsPipelineValid,
  setJobsValidationErrors,
  startPipelineAction,
  stopPipelineAction,
} from 'uiSrc/slices/rdi/pipeline'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { validatePipeline } from 'uiSrc/components/yaml-validator'
import {
  IActionPipelineResultProps,
  PipelineAction,
  PipelineStatus,
} from 'uiSrc/slices/interfaces'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Theme } from 'uiSrc/components/base/theme/types'
import DeployPipelineButton from '../buttons/deploy-pipeline-button'
import ResetPipelineButton from '../buttons/reset-pipeline-button'
import RdiConfigFileActionMenu from '../rdi-config-file-action-menu'
import StopPipelineButton from '../buttons/stop-pipeline-button'
import StartPipelineButton from '../buttons/start-pipeline-button/StartPipelineButton'

const VerticalDelimiter = styled(FlexItem)`
  border: ${({ theme }: { theme: Theme }) => theme.components.appBar.separator};
  align-self: stretch;
`

export interface Props {
  pipelineStatus?: PipelineStatus
}

const PipelineActions = ({ pipelineStatus }: Props) => {
  const {
    loading: deployLoading,
    schema,
    monacoJobsSchema,
    jobNameSchema,
    config,
    jobs,
  } = useSelector(rdiPipelineSelector)
  const { loading: actionLoading, action } = useSelector(
    rdiPipelineActionSelector,
  )

  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()

  const dispatch = useDispatch()

  useEffect(() => {
    if (!jobs && !config) {
      dispatch(setIsPipelineValid(false))
      return
    }

    const { result, configValidationErrors, jobsValidationErrors } =
      validatePipeline({
        schema,
        monacoJobsSchema,
        jobNameSchema,
        config,
        jobs,
      })

    dispatch(setConfigValidationErrors(configValidationErrors))
    dispatch(setJobsValidationErrors(jobsValidationErrors))
    dispatch(setIsPipelineValid(result))
  }, [schema, config, jobs])

  const actionPipelineCallback = useCallback(
    (event: TelemetryEvent, result: IActionPipelineResultProps) => {
      sendEventTelemetry({
        event,
        eventData: {
          id: rdiInstanceId,
          ...result,
        },
      })
      dispatch(getPipelineStatusAction(rdiInstanceId))
    },
    [rdiInstanceId],
  )

  const resetPipeline = useCallback(() => {
    dispatch(
      resetPipelineAction(
        rdiInstanceId,
        (result: IActionPipelineResultProps) =>
          actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_RESET, result),
        (result: IActionPipelineResultProps) =>
          actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_RESET, result),
      ),
    )
  }, [rdiInstanceId])

  const onReset = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_RESET_CLICKED,
      eventData: {
        id: rdiInstanceId,
        pipelineStatus,
      },
    })
    resetPipeline()
  }

  const onStartPipeline = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_START_CLICKED,
      eventData: {
        id: rdiInstanceId,
      },
    })
    dispatch(
      startPipelineAction(
        rdiInstanceId,
        (result: IActionPipelineResultProps) =>
          actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_STARTED, result),
        (result: IActionPipelineResultProps) =>
          actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_STARTED, result),
      ),
    )
  }

  const onStopPipeline = () => {
    sendEventTelemetry({
      event: TelemetryEvent.RDI_PIPELINE_STOP_CLICKED,
      eventData: {
        id: rdiInstanceId,
      },
    })
    dispatch(
      stopPipelineAction(
        rdiInstanceId,
        (result) =>
          actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_STOPPED, result),
        (result) =>
          actionPipelineCallback(TelemetryEvent.RDI_PIPELINE_STOPPED, result),
      ),
    )
  }

  const isLoadingBtn = (actionBtn: PipelineAction) =>
    action === actionBtn && actionLoading
  const disabled = deployLoading || actionLoading

  const getActionButtonState = (): {
    button: 'start' | 'stop' | null
    disabled: boolean
  } => {
    if (action === PipelineAction.Stop) {
      return {
        disabled: true,
        button: 'stop',
      }
    }

    if (action === PipelineAction.Start) {
      return {
        disabled: true,
        button: 'start',
      }
    }

    switch (pipelineStatus) {
      case PipelineStatus.NotReady: // v1 status
      case PipelineStatus.Stopped:
        return {
          disabled: false,
          button: 'start',
        }
      case PipelineStatus.Ready: // v1 status
      case PipelineStatus.Unknown:
      case PipelineStatus.Error:
      case PipelineStatus.Started:
        return {
          disabled: false,
          button: 'stop',
        }
      case PipelineStatus.Stopping:
      case PipelineStatus.Starting:
      case PipelineStatus.Creating:
      case PipelineStatus.Updating:
      case PipelineStatus.Deleting:
      case PipelineStatus.Resetting:
      case PipelineStatus.Pending:
        return {
          disabled: true,
          button: 'stop',
        }
      default:
        return {
          disabled: true,
          button: null,
        }
    }
  }

  const actionButtonState = getActionButtonState()

  return (
    <Row gap="l" justify="end" align="center">
      <FlexItem>
        <ResetPipelineButton
          onClick={onReset}
          disabled={disabled}
          loading={isLoadingBtn(PipelineAction.Reset)}
        />
      </FlexItem>
      <VerticalDelimiter />
      <FlexItem>
        {actionButtonState.button === 'stop' ? (
          <StopPipelineButton
            onClick={onStopPipeline}
            disabled={actionButtonState.disabled || deployLoading}
            loading={isLoadingBtn(PipelineAction.Stop)}
          />
        ) : actionButtonState.button === 'start' ? (
          <StartPipelineButton
            onClick={onStartPipeline}
            disabled={actionButtonState.disabled || deployLoading}
            loading={isLoadingBtn(PipelineAction.Start)}
          />
        ) : null}
      </FlexItem>
      <FlexItem>
        <DeployPipelineButton disabled={disabled} onReset={resetPipeline} />
      </FlexItem>
      <FlexItem>
        <RdiConfigFileActionMenu />
      </FlexItem>
    </Row>
  )
}

export default PipelineActions
