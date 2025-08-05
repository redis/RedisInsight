import React, { useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import {
  addInstancesRedisCloud,
  cloudSelector,
  fetchSubscriptionsRedisCloud,
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import {
  formatLongName,
  parseInstanceOptionsCloud,
  replaceSpaces,
  setTitle,
} from 'uiSrc/utils'
import {
  InstanceRedisCloud,
  LoadedCloud,
  OAuthSocialAction,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import {
  DatabaseListModules,
  DatabaseListOptions,
  RiTooltip,
} from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { oauthCloudUserSelector } from 'uiSrc/slices/oauth/cloud'
import { RiIconButton } from 'uiSrc/components/base/forms'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { Text } from 'uiSrc/components/base/text'
import { ColumnDefinition } from 'uiSrc/components/base/layout/table'
import RedisCloudDatabases from './RedisCloudDatabases'

import styles from './styles.module.scss'

const RedisCloudDatabasesPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    ssoFlow,
    credentials,
    data: instances,
    dataAdded: instancesAdded,
  } = useSelector(cloudSelector)
  const { data: userOAuthProfile } = useSelector(oauthCloudUserSelector)
  const currentAccountIdRef = useRef(userOAuthProfile?.id)
  const ssoFlowRef = useRef(ssoFlow)

  setTitle('Redis Cloud Databases')

  useEffect(() => {
    if (instances === null) {
      history.push(Pages.home)
    }

    dispatch(resetLoadedRedisCloud(LoadedCloud.Instances))
  }, [])

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
      event: TelemetryEvent.CONFIG_DATABASES_RE_CLOUD_AUTODISCOVERY_CANCELLED,
    })
  }

  const handleClose = () => {
    sendCancelEvent()
    dispatch(resetDataRedisCloud())
    history.push(Pages.home)
  }

  const handleBackAdditing = () => {
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

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  const columns: ColumnDefinition<InstanceRedisCloud>[] = [
    {
      header: 'Database',
      id: 'name',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({
        row: {
          original: { name },
        },
      }) => {
        const cellContent = replaceSpaces(name.substring(0, 200))
        return (
          <div role="presentation" data-testid={`db_name_${name}`}>
            <RiTooltip
              position="bottom"
              title="Database"
              className={styles.tooltipColumnName}
              anchorClassName="truncateText"
              content={formatLongName(name)}
            >
              <Text>{cellContent}</Text>
            </RiTooltip>
          </div>
        )
      },
    },
    {
      header: 'Subscription ID',
      id: 'subscriptionId',
      accessorKey: 'subscriptionId',
      enableSorting: true,
      cell: ({
        row: {
          original: { subscriptionId },
        },
      }) => (
        <span data-testid={`sub_id_${subscriptionId}`}>{subscriptionId}</span>
      ),
    },
    {
      header: 'Subscription',
      id: 'subscriptionName',
      accessorKey: 'subscriptionName',
      enableSorting: true,
      cell: ({
        row: {
          original: { subscriptionName: name },
        },
      }) => {
        const cellContent = replaceSpaces(name.substring(0, 200))
        return (
          <div role="presentation">
            <RiTooltip
              position="bottom"
              title="Subscription"
              className={styles.tooltipColumnName}
              anchorClassName="truncateText"
              content={formatLongName(name)}
            >
              <Text>{cellContent}</Text>
            </RiTooltip>
          </div>
        )
      },
    },
    {
      header: 'Type',
      id: 'subscriptionType',
      accessorKey: 'subscriptionType',
      enableSorting: true,
      cell: ({
        row: {
          original: { subscriptionType },
        },
      }) => RedisCloudSubscriptionTypeText[subscriptionType!] ?? '-',
    },
    {
      header: 'Status',
      id: 'status',
      accessorKey: 'status',
      enableSorting: true,
    },
    {
      header: 'Endpoint',
      id: 'publicEndpoint',
      accessorKey: 'publicEndpoint',
      enableSorting: true,
      cell: ({
        row: {
          original: { publicEndpoint },
        },
      }) => {
        const text = publicEndpoint
        return (
          <div className="public_endpoint">
            <Text className="copyPublicEndpointText">{text}</Text>
            <RiTooltip
              position="right"
              content="Copy"
              anchorClassName="copyPublicEndpointTooltip"
            >
              <RiIconButton
                icon={CopyIcon}
                aria-label="Copy public endpoint"
                className="copyPublicEndpointBtn"
                onClick={() => handleCopy(text)}
              />
            </RiTooltip>
          </div>
        )
      },
    },
    {
      header: 'Capabilities',
      id: 'modules',
      accessorKey: 'modules',
      enableSorting: true,
      cell: function Modules({ row: { original: instance } }) {
        return (
          <DatabaseListModules
            modules={instance.modules.map((name) => ({ name }))}
          />
        )
      },
    },
    {
      header: 'Options',
      id: 'options',
      accessorKey: 'options',
      enableSorting: true,
      cell: ({ row: { original: instance } }) => {
        const options = parseInstanceOptionsCloud(
          instance.databaseId,
          instances || [],
        )
        return <DatabaseListOptions options={options} />
      },
    },
  ]

  return (
    <RedisCloudDatabases
      onClose={handleClose}
      onBack={handleBackAdditing}
      onSubmit={handleAddInstances}
      columns={columns}
    />
  )
}

export default RedisCloudDatabasesPage
