import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  addInstancesRedisCluster,
  clusterSelector,
  resetDataRedisCluster,
  resetInstancesRedisCluster,
} from 'uiSrc/slices/instances/cluster'
import { Maybe, setTitle } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import { redisClusterDatabasesColumns } from './config/RedisClusterDatabases.config'
import { RedisClusterIds } from './constants/constants'

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
    [dispatch, credentials],
  )

  const [columns, columnsResult] = useMemo(() => {
    const items = instances || []

    const shouldShowSelection = items.length > 0
    const shouldShowCapabilities = items.some(
      (instance) => instance.modules?.length,
    )
    const shouldShowOptions = items.some(
      (instance) =>
        instance.options &&
        Object.values(instance.options).filter(Boolean).length,
    )

    const cols = redisClusterDatabasesColumns.filter((col) => {
      if (col.id === RedisClusterIds.Selection && !shouldShowSelection) {
        return false
      }
      if (col.id === RedisClusterIds.Capabilities && !shouldShowCapabilities) {
        return false
      }
      if (col.id === RedisClusterIds.Options && !shouldShowOptions) {
        return false
      }
      return col.id !== RedisClusterIds.Result
    })
    const resultColumn = redisClusterDatabasesColumns.find(
      (col) => col.id === RedisClusterIds.Result,
    )
    const colsResult = [
      ...redisClusterDatabasesColumns.filter((col) => {
        return col.id !== RedisClusterIds.Selection
      }),
      resultColumn,
    ]

    return [cols, colsResult]
  }, [instances])

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
