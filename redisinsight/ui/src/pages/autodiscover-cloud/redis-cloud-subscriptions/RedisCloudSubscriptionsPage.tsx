import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { isNumber } from 'lodash'

import { Pages } from 'uiSrc/constants'
import {
  InstanceRedisCloud,
  LoadedCloud,
  OAuthSocialAction,
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
  RedisCloudSubscriptionStatusText,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import { RiTooltip } from 'uiSrc/components'
import {
  cloudSelector,
  fetchInstancesRedisCloud,
  fetchSubscriptionsRedisCloud,
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import { formatLongName, Maybe, replaceSpaces, setTitle } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { RiIconButton } from 'uiSrc/components/base/forms'
import { ToastDangerIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { ColumnDefinition } from 'uiSrc/components/base/layout'
import RedisCloudSubscriptions from './RedisCloudSubscriptions/RedisCloudSubscriptions'

import styles from './styles.module.scss'

const RedisCloudSubscriptionsPage = () => {
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

  setTitle('Redis Cloud Subscriptions')

  useEffect(() => {
    if (subscriptions === null) {
      history.push(Pages.home)
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
      event: TelemetryEvent.CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_CANCELLED,
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

  const AlertStatusContent = () => (
    <ul className={styles.tooltipStatusList}>
      <li>
        <span className={styles.dot} />
        Subscription status is not Active
      </li>
      <li>
        <span className={styles.dot} />
        Subscription does not have any databases
      </li>
      <li>
        <span className={styles.dot} />
        Error fetching subscription details
      </li>
    </ul>
  )

  const columns: ColumnDefinition<RedisCloudSubscription>[] = [
    {
      id: 'alert',
      accessorKey: 'alert',
      header: '',
      cell: function AlertIcon({
        row: {
          original: { status, numberOfDatabases },
        },
      }) {
        return status !== RedisCloudSubscriptionStatus.Active ||
          numberOfDatabases === 0 ? (
          <RiTooltip
            title={
              <p>
                This subscription is not available for one of the following
                reasons:
              </p>
            }
            content={<AlertStatusContent />}
            position="right"
            className={styles.tooltipStatus}
          >
            <RiIconButton
              icon={ToastDangerIcon}
              aria-label="subscription alert"
            />
          </RiTooltip>
        ) : null
      },
    },
    {
      id: 'id',
      accessorKey: 'id',
      header: 'Id',
      enableSorting: true,
      cell: ({
        row: {
          original: { id },
        },
      }) => <span data-testid={`id_${id}`}>{id}</span>,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: 'Subscription',
      enableSorting: true,
      cell: function InstanceCell({
        row: {
          original: { name },
        },
      }) {
        const cellContent = replaceSpaces(name.substring(0, 200))
        return (
          <div role="presentation">
            <RiTooltip
              position="bottom"
              title="Subscription"
              className={styles.tooltipColumnName}
              content={formatLongName(name)}
            >
              <Text>{cellContent}</Text>
            </RiTooltip>
          </div>
        )
      },
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: 'Type',
      enableSorting: true,
      cell: ({
        row: {
          original: { type },
        },
      }) => RedisCloudSubscriptionTypeText[type] ?? '-',
    },
    {
      id: 'provider',
      accessorKey: 'provider',
      header: 'Cloud provider',
      enableSorting: true,
      cell: ({
        row: {
          original: { provider },
        },
      }) => provider ?? '-',
    },
    {
      id: 'region',
      accessorKey: 'region',
      header: 'Region',
      enableSorting: true,
      cell: ({
        row: {
          original: { region },
        },
      }) => region ?? '-',
    },
    {
      id: 'numberOfDatabases',
      accessorKey: 'numberOfDatabases',
      header: '# databases',
      enableSorting: true,
      cell: ({
        row: {
          original: { numberOfDatabases },
        },
      }) => (isNumber(numberOfDatabases) ? numberOfDatabases : '-'),
    },
    {
      id: 'status',
      accessorKey: 'status',
      header: 'Status',
      enableSorting: true,
      cell: ({
        row: {
          original: { status },
        },
      }) => RedisCloudSubscriptionStatusText[status] ?? '-',
    },
  ]

  return (
    <RedisCloudSubscriptions
      columns={columns}
      subscriptions={subscriptions}
      loading={loading}
      account={account}
      error={subscriptionsError || accountError || ''}
      onClose={handleClose}
      onBack={handleBackAdding}
      onSubmit={handleLoadInstances}
    />
  )
}

export default RedisCloudSubscriptionsPage
