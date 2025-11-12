import { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  InstanceRedisCloud,
  LoadedCloud,
  OAuthSocialAction,
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
} from 'uiSrc/slices/interfaces'
import {
  ColumnDef,
  Row,
  RowSelectionState,
} from 'uiSrc/components/base/layout/table'
import {
  cloudSelector,
  fetchInstancesRedisCloud,
  fetchSubscriptionsRedisCloud,
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { Maybe, setTitle } from 'uiSrc/utils'
import { Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  AlertColumn,
  IdColumn,
  NumberOfDbsColumn,
  ProviderColumn,
  RegionColumn,
  SelectionColumn,
  StatusColumn,
  SubscriptionColumn,
  TypeColumn,
} from 'uiSrc/pages/autodiscover-cloud/column-definitions'

export function canSelectRow({ original }: Row<RedisCloudSubscription>) {
  return (
    original.status === RedisCloudSubscriptionStatus.Active &&
    original.numberOfDatabases !== 0
  )
}

export const colFactory = (
  items: RedisCloudSubscription[],
): ColumnDef<RedisCloudSubscription>[] => {
  const cols: ColumnDef<RedisCloudSubscription>[] = [
    AlertColumn(),
    IdColumn(),
    SubscriptionColumn(),
    TypeColumn(),
    ProviderColumn(),
    RegionColumn(),
    NumberOfDbsColumn(),
    StatusColumn(),
  ]
  if (items.length > 0) {
    cols.unshift(SelectionColumn())
  }
  return cols
}

export const useCloudSubscriptionConfig = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    ssoFlow,
    credentials,
    subscriptions,
    loading,
    error: subscriptionsError,
    loaded: { instances: instancesLoaded },
    account: { error: accountError, data: account },
  } = useSelector(cloudSelector)
  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)
  const currentAccountIdRef = useRef(userOAuthProfile?.id)
  const ssoFlowRef = useRef(ssoFlow)

  useEffect(() => {
    if (subscriptions === null) {
      history.push(Pages.home)
    } else {
      setTitle('Redis Cloud Subscriptions')
    }
  }, [])

  useEffect(() => {
    if (ssoFlowRef.current !== OAuthSocialAction.Import) return

    if (!userOAuthProfile) {
      history.push(Pages.home)
      return
    }

    if (currentAccountIdRef.current !== userOAuthProfile?.id) {
      dispatch(fetchSubscriptionsRedisCloud(null, true))
      currentAccountIdRef.current = userOAuthProfile?.id
    }
  }, [userOAuthProfile])

  useEffect(() => {
    if (instancesLoaded) {
      history.push(Pages.redisCloudDatabases)
    }
  }, [instancesLoaded])

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
    dispatch(resetLoadedRedisCloud(LoadedCloud.Subscriptions))
    history.push(Pages.home)
  }

  const handleLoadInstances = (
    subscriptions: Maybe<
      Pick<InstanceRedisCloud, 'subscriptionId' | 'subscriptionType' | 'free'>
    >[],
  ) => {
    dispatch(
      fetchInstancesRedisCloud(
        { subscriptions, credentials },
        ssoFlow === OAuthSocialAction.Import,
      ),
    )
  }

  const [selection, setSelection] = useState<RedisCloudSubscription[]>([])

  const handleSelectionChange = (currentSelected: RowSelectionState) => {
    const newSelection = subscriptions?.filter((item) => {
      const { id } = item
      if (!id) {
        return false
      }
      return currentSelected[id]
    })
    setSelection(newSelection || [])
  }

  const columns: ColumnDef<RedisCloudSubscription>[] = useMemo(
    () => colFactory(subscriptions || []),
    [subscriptions],
  )

  return {
    columns,
    selection,
    loading,
    account,
    subscriptions,
    subscriptionsError,
    accountError,
    handleClose,
    handleBackAdding,
    handleLoadInstances,
    handleSelectionChange,
  }
}
