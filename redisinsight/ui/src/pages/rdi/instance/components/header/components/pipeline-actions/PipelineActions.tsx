import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

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
  CollectorStatus,
  IActionPipelineResultProps,
  PipelineAction,
  PipelineStatus,
} from 'uiSrc/slices/interfaces'

import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import DeployPipelineButton from '../buttons/deploy-pipeline-button'
import ResetPipelineButton from '../buttons/reset-pipeline-button'
import RdiConfigFileActionMenu from '../rdi-config-file-action-menu'
import StopPipelineButton from '../buttons/stop-pipeline-button'
import StartPipelineButton from '../buttons/start-pipeline-button/StartPipelineButton'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

const VerticalDelimiter = styled(FlexItem)`
  border: ${({ theme }: { theme: Theme }) =>
    theme.components.appBar.separator};
  align-self: stretch;
`

export interface Props {
  collectorStatus?: CollectorStatus
  pipelineStatus?: PipelineStatus
}

const PipelineActions = ({ collectorStatus, pipelineStatus }: Props) => {
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
        {collectorStatus === CollectorStatus.Ready ? (
          <StopPipelineButton
            onClick={onStopPipeline}
            disabled={disabled}
            loading={isLoadingBtn(PipelineAction.Stop)}
          />
        ) : (
          <StartPipelineButton
            onClick={onStartPipeline}
            disabled={disabled}
            loading={isLoadingBtn(PipelineAction.Start)}
          />
        )}
      </FlexItem>
      <FlexItem>
        <DeployPipelineButton
          loading={deployLoading}
          disabled={disabled}
          onReset={resetPipeline}
        />
      </FlexItem>
      <FlexItem>
        <RdiConfigFileActionMenu />
      </FlexItem>
    </Row>
  )
}

export default PipelineActions
