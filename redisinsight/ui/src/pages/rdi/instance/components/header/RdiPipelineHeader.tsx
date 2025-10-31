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
import styles from './styles.module.scss'

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
    <Row className={styles.wrapper} align="center" justify="between">
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
    </Row>
  )
}

export default RdiPipelineHeader
