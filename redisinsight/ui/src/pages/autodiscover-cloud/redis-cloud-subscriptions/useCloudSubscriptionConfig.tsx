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
  RedisCloudSubscriptionType,
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
  SelectAllCheckbox,
} from 'uiSrc/pages/autodiscover-cloud/redis-cloud-subscriptions/RedisCloudSubscriptions/RedisCloudSubscriptions.styles'
import { Checkbox } from 'uiSrc/components/base/forms/checkbox/Checkbox'
import { RiTooltip } from 'uiSrc/components'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { ToastDangerIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'

// TODO - 25.08.25 - remove mock
const mockAccount = {
  accountId: 1,
  accountName: 'Viktar',
  ownerEmail: 'viktar.pavlov@redis.com',
  ownerName: 'Viktar Pavlov',
}

// TODO - 25.08.25 - remove mock
export const mockSubscriptions: RedisCloudSubscription[] = [
  {
    id: 2854056,
    name: 'name',
    type: RedisCloudSubscriptionType.Fixed,
    numberOfDatabases: 1,
    provider: 'aws',
    region: 'us-east-1',
    status: RedisCloudSubscriptionStatus.Active,
    free: false,
  },
  {
    id: 2854057,
    name: 'name 2',
    type: RedisCloudSubscriptionType.Fixed,
    numberOfDatabases: 1,
    provider: 'aws',
    region: 'us-east-1',
    status: RedisCloudSubscriptionStatus.Active,
    free: false,
  },
  {
    id: 28540562,
    name: 'name-2',
    type: RedisCloudSubscriptionType.Flexible,
    numberOfDatabases: 2,
    provider: 'azure',
    region: 'centralus',
    status: RedisCloudSubscriptionStatus.NotActivated,
    free: false,
  },
  {
    id: 2854056223,
    name: 'name-3',
    type: RedisCloudSubscriptionType.Flexible,
    numberOfDatabases: 3,
    provider: 'gcp',
    region: 'us-west1',
    status: RedisCloudSubscriptionStatus.Deleting,
    free: true,
  },
]

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
      subscriptions = mockSubscriptions
      // history.push(Pages.home)
    }
  }, [])

  useEffect(() => {
    if (ssoFlowRef.current !== OAuthSocialAction.Import) return

    if (!userOAuthProfile) {
      // history.push(Pages.home)
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
    {
      id: 'select-col',
      size: 50,
      enableResizing: false,
      header: ({ table }) => (
        <SelectAllCheckbox
          checked={table.getIsAllRowsSelected()}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const selected = event.target.checked
            table.toggleAllRowsSelected()
            if (selected) {
              const rows = table.getRowModel().rows
              setSelection(
                rows
                  .filter((row) => canSelectRow(row))
                  .map((row) => row.original),
              )
            } else {
              setSelection([])
            }
          }} //or getToggleAllPageRowsSelectedHandler
        />
      ),
      cell: ({ row }) => {
        const canSelect = canSelectRow(row)
        return (
          <Checkbox
            checked={canSelect && row.getIsSelected()}
            disabled={!canSelect}
            onChange={() => {
              row.toggleSelected()
              onSelectionChange(row.original)
            }}
          />
        )
      },
    },
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
    account: account ?? mockAccount,
    subscriptions: subscriptions ? subscriptions : mockSubscriptions,
    subscriptionsError,
    accountError,
    handleClose,
    handleBackAdding,
    handleLoadInstances,
  }
}
