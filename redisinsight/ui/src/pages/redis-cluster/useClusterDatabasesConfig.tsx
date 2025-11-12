import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  addInstancesRedisCluster,
  clusterSelector,
  resetDataRedisCluster,
  resetInstancesRedisCluster,
} from 'uiSrc/slices/instances/cluster'
import { Maybe, Nullable, setTitle } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import { InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  EndpointColumn,
  ResultColumn,
  CapabilitiesColumn,
  DatabaseColumn,
  OptionsColumn,
  SelectionColumn,
  StatusColumn,
} from './column-definitions'

export const colFactory = (instances: Nullable<InstanceRedisCluster[]>) => {
  let columns: ColumnDef<InstanceRedisCluster>[] = [
    DatabaseColumn(),
    StatusColumn(),
    EndpointColumn(),
    CapabilitiesColumn(),
    OptionsColumn(instances || []),
  ]
  if (instances && instances.length > 0) {
    columns.unshift(SelectionColumn())
  }

  const messageColumn = ResultColumn()
  const columnsResult: ColumnDef<InstanceRedisCluster>[] = [
    ...columns,
    messageColumn,
  ]
  // remove selection column from result columns
  columnsResult.shift()
  return [columns, columnsResult]
}
const sendCancelEvent = () => {
  sendEventTelemetry({
    event:
      TelemetryEvent.CONFIG_DATABASES_REDIS_SOFTWARE_AUTODISCOVERY_CANCELLED,
  })
}
export const useClusterDatabasesConfig = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    credentials,
    data: instances,
    dataAdded: instancesAdded,
    loading,
  } = useSelector(clusterSelector)

  useEffect(() => {
    setTitle('Auto-Discover Redis Enterprise Databases')
  }, [])

  const handleClose = useCallback(
    (sendEvent = true) => {
      sendEvent && sendCancelEvent()
      dispatch(resetDataRedisCluster())
      history.push(Pages.home)
    },
    [dispatch, history],
  )
  const handleBackAdding = useCallback(
    (sendEvent = true) => {
      sendEvent && sendCancelEvent()
      dispatch(resetInstancesRedisCluster())
      history.push(Pages.home)
    },
    [dispatch, history],
  )

  const handleAddInstances = useCallback(
    (uids: Maybe<number>[]) => {
      dispatch(addInstancesRedisCluster({ uids, credentials }))
    },
    [dispatch],
  )

  const [columns, columnsResult] = useMemo(
    () => colFactory(instances),
    [instances],
  )

  return {
    columns,
    columnsResult,
    instances,
    instancesAdded,
    loading,
    handleClose,
    handleBackAdding,
    handleAddInstances,
  }
}
