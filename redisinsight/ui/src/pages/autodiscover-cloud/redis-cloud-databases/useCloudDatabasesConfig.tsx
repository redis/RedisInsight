import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  addInstancesRedisCloud,
  cloudSelector,
  fetchSubscriptionsRedisCloud,
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { setTitle } from 'uiSrc/utils'
import { Pages } from 'uiSrc/constants'
import {
  InstanceRedisCloud,
  LoadedCloud,
  OAuthSocialAction,
} from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  ColumnDef,
  RowSelectionState,
} from 'uiSrc/components/base/layout/table'
import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'
import {
  DatabaseColumn,
  EndpointColumn,
  ModulesColumn,
  OptionsColumn,
  StatusDbColumn,
  SubscriptionDbColumn,
  SubscriptionIdColumn,
  SubscriptionTypeColumn,
} from '../column-definitions'

export const colFactory = (instances: InstanceRedisCloud[]) => {
  const columns: ColumnDef<InstanceRedisCloud>[] = [
    getSelectionColumn<InstanceRedisCloud>(),
    DatabaseColumn(),
    SubscriptionIdColumn(),
    SubscriptionDbColumn(),
    SubscriptionTypeColumn(),
    StatusDbColumn(),
    EndpointColumn(),
    ModulesColumn(),
    OptionsColumn(instances),
  ]

  return columns
}

export const useCloudDatabasesConfig = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    ssoFlow,
    credentials,
    loading,
    data: instances,
    dataAdded: instancesAdded,
  } = useSelector(cloudSelector)

  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)

  const currentAccountIdRef = useRef(userOAuthProfile?.id)
  const ssoFlowRef = useRef(ssoFlow)

  setTitle('Redis Cloud Databases')

  const [selection, setSelection] = useState<InstanceRedisCloud[]>([])

  const handleSelectionChange = (currentSelected: RowSelectionState) => {
    debugger
    const newSelection = instances?.filter((item) => {
      const { id } = item
      if (!id) {
        return false
      }
      return currentSelected[id]
    })
    setSelection(newSelection || [])
  }

  useEffect(() => {
    if (instances === null) {
      history.push(Pages.home)
    }

    dispatch(resetLoadedRedisCloud(LoadedCloud.Instances))
  }, [instances])

  useEffect(() => {
    if (ssoFlowRef.current !== OAuthSocialAction.Import) return

    if (!userOAuthProfile) {
      dispatch(resetDataRedisCloud())
      history.push(Pages.home)
      return
    }

    if (currentAccountIdRef.current !== userOAuthProfile?.id) {
      dispatch(
        fetchSubscriptionsRedisCloud(null, true, () => {
          history.push(Pages.redisCloudSubscriptions)
        }),
      )
    }
  }, [userOAuthProfile])

  useEffect(() => {
    if (instancesAdded.length) {
      history.push(Pages.redisCloudDatabasesResult)
    }
  }, [instancesAdded])

  const sendCancelEvent = () => {
    sendEventTelemetry({
      event:
        TelemetryEvent.CONFIG_DATABASES_REDIS_CLOUD_AUTODISCOVERY_CANCELLED,
    })
  }

  const handleClose = () => {
    sendCancelEvent()
    dispatch(resetDataRedisCloud())
    history.push(Pages.home)
  }

  const handleBackAdding = () => {
    sendCancelEvent()
    dispatch(resetLoadedRedisCloud(LoadedCloud.Instances))
    history.push(Pages.home)
  }

  const handleAddInstances = (
    databases: Pick<
      InstanceRedisCloud,
      'subscriptionId' | 'databaseId' | 'free'
    >[],
  ) => {
    dispatch(
      addInstancesRedisCloud(
        { databases, credentials },
        ssoFlow === OAuthSocialAction.Import,
      ),
    )
  }

  const columns = useMemo(() => colFactory(instances || []), [instances])

  return {
    columns,
    selection,
    instances,
    loading,
    handleClose,
    handleBackAdding,
    handleAddInstances,
    handleSelectionChange,
  }
}
