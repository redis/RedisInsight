import { useCallback, useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useHistory } from 'react-router-dom'

import {
  addInstancesRedisCluster,
  clusterSelector,
  resetDataRedisCluster,
  resetInstancesRedisCluster,
} from 'uiSrc/slices/instances/cluster'
import { Maybe, Nullable, setTitle } from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import { type InstanceRedisCluster } from 'uiSrc/slices/interfaces'
import { type ColumnDef } from 'uiSrc/components/base/layout/table'
import {
  capabilitiesColumn,
  databaseColumn,
  endpointColumn,
  optionsColumn,
  resultColumn,
  selectionColumn,
  statusColumn,
} from './column-definitions'

export const colFactory = (instances: Nullable<InstanceRedisCluster[]>) => {
  let columns: ColumnDef<InstanceRedisCluster>[] = [
    databaseColumn(),
    statusColumn(),
    endpointColumn(),
    capabilitiesColumn(),
    optionsColumn(instances || []),
  ]
  if (instances && instances.length > 0) {
    columns.unshift(selectionColumn())
  }

  const columnsResult: ColumnDef<InstanceRedisCluster>[] = [
    ...columns,
    resultColumn(),
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
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const history = useHistory()

  const {
    credentials,
    data: instances,
    dataAdded: instancesAdded,
    loading,
  } = useAppSelector(clusterSelector)

  useEffect(() => {
    setTitle(t('cluster.databases.title'))
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
