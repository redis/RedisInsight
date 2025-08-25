import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { isNumber } from 'lodash'

import {
  InstanceRedisCloud,
  LoadedCloud,
  OAuthSocialAction,
  RedisCloudSubscription,
  RedisCloudSubscriptionStatus,
  RedisCloudSubscriptionStatusText,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import {
  ColumnDefinition,
  RowDefinition,
} from 'uiSrc/components/base/layout/table'
import {
  cloudSelector,
  fetchInstancesRedisCloud,
  fetchSubscriptionsRedisCloud,
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { formatLongName, Maybe, replaceSpaces, setTitle } from 'uiSrc/utils'
import { Pages } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import styles from 'uiSrc/pages/autodiscover-cloud/redis-cloud-subscriptions/styles.module.scss'
import {
  AlertStatusDot,
  AlertStatusList,
  AlertStatusListItem,
} from 'uiSrc/pages/autodiscover-cloud/redis-cloud-subscriptions/RedisCloudSubscriptions/RedisCloudSubscriptions.styles'
import { RiTooltip } from 'uiSrc/components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { ToastDangerIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'

function canSelectRow(row: RowDefinition<RedisCloudSubscription>) {
  return (
    row.original.status === RedisCloudSubscriptionStatus.Active &&
    row.original.numberOfDatabases !== 0 &&
    row.getCanSelect()
  )
}

export const useCloudSubscriptionConfig = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  let {
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
    <AlertStatusList gap="none">
      <AlertStatusListItem
        size="s"
        label="Subscription status is not Active"
        icon={<AlertStatusDot />}
      />
      <AlertStatusListItem
        size="s"
        wrapText
        label="Subscription does not have any databases"
        icon={<AlertStatusDot />}
      />
      <AlertStatusListItem
        size="s"
        label="Error fetching subscription details"
        icon={<AlertStatusDot />}
      />
    </AlertStatusList>
  )
  const [selection, setSelection] = useState<RedisCloudSubscription[]>([])
  const onSelectionChange = (selected: RedisCloudSubscription) =>
    setSelection((previous) => {
      const canSelect =
        selected.status === RedisCloudSubscriptionStatus.Active &&
        selected.numberOfDatabases !== 0

      if (!canSelect) {
        return previous
      }

      const isSelected = previous.some(
        (item) => item.id === selected.id && item.type === selected.type,
      )
      if (isSelected) {
        return previous.filter(
          (item) => !(item.id === selected.id && item.type === selected.type),
        )
      }
      return [...previous, selected]
    })

  const columns: ColumnDefinition<RedisCloudSubscription>[] = [
    getSelectionColumn({
      setSelection,
      onSelectionChange,
      canSelectRow,
    }),
    {
      id: 'alert',
      accessorKey: 'alert',
      header: '',
      enableResizing: false,
      enableSorting: false,
      size: 50,
      cell: ({
        row: {
          original: { status, numberOfDatabases },
        },
      }) =>
        status !== RedisCloudSubscriptionStatus.Active ||
        numberOfDatabases === 0 ? (
          <RiTooltip
            title={
              <Text size="S">
                This subscription is not available for one of the following
                reasons:
              </Text>
            }
            content={<AlertStatusContent />}
            position="right"
            className={styles.tooltipStatus}
          >
            <IconButton
              icon={ToastDangerIcon}
              aria-label="subscription alert"
            />
          </RiTooltip>
        ) : null,
    },
    {
      id: 'id',
      accessorKey: 'id',
      header: 'Id',
      enableSorting: true,
      size: 80,
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

  return {
    columns,
    selection,
    loading,
    account: account,
    subscriptions: subscriptions,
    subscriptionsError,
    accountError,
    handleClose,
    handleBackAdding,
    handleLoadInstances,
  }
}
