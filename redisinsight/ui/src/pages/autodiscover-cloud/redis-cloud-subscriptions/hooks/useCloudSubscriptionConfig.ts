import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import {
  InstanceRedisCloud,
  LoadedCloud,
  OAuthSocialAction,
  RedisCloudSubscription,
} from 'uiSrc/slices/interfaces'
import { RowSelectionState } from 'uiSrc/components/base/layout/table'
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

import { redisCloudSubscriptionsColumns } from '../../config/RedisCloudSubscriptions.config'
import { UseCloudSubscriptionConfigReturn } from './useCloudSubscriptionConfig.types'
import { AutoDiscoverCloudIds } from 'uiSrc/pages/autodiscover-cloud/constants/constants'

export const useCloudSubscriptionConfig =
  (): UseCloudSubscriptionConfigReturn => {
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

    const [selection, setSelection] = useState<RedisCloudSubscription[]>([])

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

    const sendCancelEvent = useCallback(() => {
      sendEventTelemetry({
        event:
          TelemetryEvent.CONFIG_DATABASES_REDIS_CLOUD_AUTODISCOVERY_CANCELLED,
      })
    }, [])

    const handleClose = useCallback(() => {
      sendCancelEvent()
      dispatch(resetDataRedisCloud())
      history.push(Pages.home)
    }, [dispatch, history, sendCancelEvent])

    const handleBackAdding = useCallback(() => {
      sendCancelEvent()
      dispatch(resetLoadedRedisCloud(LoadedCloud.Subscriptions))
      history.push(Pages.home)
    }, [dispatch, history, sendCancelEvent])

    const handleLoadInstances = useCallback(
      (
        subscriptions: Maybe<
          Pick<
            InstanceRedisCloud,
            'subscriptionId' | 'subscriptionType' | 'free'
          >
        >[],
      ) => {
        dispatch(
          fetchInstancesRedisCloud(
            { subscriptions, credentials },
            ssoFlow === OAuthSocialAction.Import,
          ),
        )
      },
      [dispatch, credentials, ssoFlow],
    )

    const handleSelectionChange = useCallback(
      (currentSelected: RowSelectionState) => {
        const newSelection = subscriptions?.filter(({ id }) => {
          if (!id) {
            return false
          }
          return currentSelected[id]
        })
        setSelection(newSelection || [])
      },
      [subscriptions],
    )

    const columns = useMemo(() => {
      const items = subscriptions || []
      if (items.length > 0) {
        return redisCloudSubscriptionsColumns
      }
      return redisCloudSubscriptionsColumns.filter(
        (col) =>
          col.id !== AutoDiscoverCloudIds.Selection &&
          col.id !== AutoDiscoverCloudIds.Alert,
      )
    }, [subscriptions])

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
