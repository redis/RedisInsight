import { useContext, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import {
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
  getDatabaseConfigInfoAction,
} from 'uiSrc/slices/instances/instances'
import {
  appConnectivityError,
  setConnectivityError,
} from 'uiSrc/slices/app/connectivity'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Nullable, toBytes, truncatePercentage } from 'uiSrc/utils'
import { getOverviewMetrics } from 'uiSrc/components/database-overview/components/OverviewMetrics'

function getUsedMemoryPercent(
  planMemoryLimit: number | undefined,
  usedMemory: Nullable<number> | undefined,
  memoryLimitMeasurementUnit = 'MB',
) {
  if (!planMemoryLimit) {
    return undefined
  }
  return parseFloat(
    `${truncatePercentage(((usedMemory || 0) / toBytes(planMemoryLimit, memoryLimitMeasurementUnit)) * 100, 1)}`,
  )
}

export const useDatabaseOverview = () => {
  const { theme } = useContext(ThemeContext)
  const dispatch = useDispatch()
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null)
  const { id: connectedInstanceId = '', db } = useSelector(
    connectedInstanceSelector,
  )
  const connectivityError = useSelector(appConnectivityError)

  const overview = useSelector(connectedInstanceOverviewSelector)
  const {
    usedMemory,
    cloudDetails: {
      subscriptionType,
      subscriptionId,
      planMemoryLimit,
      memoryLimitMeasurementUnit,
      isBdbPackages,
    } = {},
  } = overview

  const loadData = () => {
    if (connectedInstanceId) {
      dispatch(
        getDatabaseConfigInfoAction(connectedInstanceId, () => {
          // Clear connectivity error on successful API call.
          // Always dispatch to avoid stale closure issues - dispatching null
          // when there's no error is a safe no-op.
          dispatch(setConnectivityError(null))
        }),
      )
      setLastRefreshTime(Date.now())
    }
  }

  useEffect(() => {
    if (!connectivityError) {
      setLastRefreshTime(Date.now())
    }
  }, [connectivityError])

  const handleEnableAutoRefresh = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) =>
    sendEventTelemetry({
      event: enableAutoRefresh
        ? TelemetryEvent.OVERVIEW_AUTO_REFRESH_ENABLED
        : TelemetryEvent.OVERVIEW_AUTO_REFRESH_DISABLED,
      eventData: {
        databaseId: connectedInstanceId,
        refreshRate: +refreshRate,
      },
    })

  const handleRefresh = () => {
    loadData()
  }
  const usedMemoryPercent = getUsedMemoryPercent(
    planMemoryLimit,
    usedMemory,
    memoryLimitMeasurementUnit,
  )

  const metrics = useMemo(() => {
    const overviewItems = {
      ...overview,
      usedMemoryPercent,
    }
    return getOverviewMetrics({
      theme,
      items: overviewItems,
      db,
    })
  }, [theme, overview, db, usedMemoryPercent])
  return {
    metrics,
    connectivityError,
    lastRefreshTime,
    subscriptionType,
    subscriptionId,
    isBdbPackages,
    usedMemoryPercent,
    handleEnableAutoRefresh,
    handleRefresh,
  }
}
