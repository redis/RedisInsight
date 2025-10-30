import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import { get } from 'lodash'
import {
  getPipelineStatusAction,
  rdiPipelineStatusSelector,
} from 'uiSrc/slices/rdi/pipeline'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import CurrentPipelineStatus from './components/current-pipeline-status'

import PipelineActions from './components/pipeline-actions'
import styled from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

const StyledRdiPipelineHeader = styled(Row)`
  padding: 0 16px;
  border-bottom: 4px solid
    ${({ theme }: { theme: Theme }) =>
      theme.components.tabs.variants.default.tabsLine.color};
  height: 58px;
`

const RdiPipelineHeader = () => {
  const [headerLoading, setHeaderLoading] = useState(true)
  const { rdiInstanceId } = useParams<{ rdiInstanceId: string }>()
  const { data: statusData, error: statusError } = useSelector(
    rdiPipelineStatusSelector,
  )
  const dispatch = useDispatch()

  let intervalId: any

  useEffect(() => {
    if (!intervalId) {
      dispatch(
        getPipelineStatusAction(
          rdiInstanceId,
          () => setHeaderLoading(false),
          () => setHeaderLoading(false),
        ),
      )
      intervalId = setInterval(() => {
        dispatch(getPipelineStatusAction(rdiInstanceId))
      }, 10000)
    }
    return () => clearInterval(intervalId)
  }, [])

  const pipelineStatus = statusData
    ? get(statusData, ['pipelines', 'default', 'status'])
    : undefined
  const pipelineState = statusData
    ? get(statusData, ['pipelines', 'default', 'state'])
    : undefined
  const collectorStatus = statusData
    ? get(statusData, ['components', 'collector-source', 'status'])
    : undefined

  return (
    <StyledRdiPipelineHeader align="center" justify="between">
      <FlexItem grow>
        <CurrentPipelineStatus
          pipelineState={pipelineState}
          statusError={statusError}
          headerLoading={headerLoading}
        />
      </FlexItem>
      <PipelineActions
        collectorStatus={collectorStatus}
        pipelineStatus={pipelineStatus}
      />
    </StyledRdiPipelineHeader>
  )
}

export default RdiPipelineHeader
