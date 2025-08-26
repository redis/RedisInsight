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
import React, { useEffect, useRef, useState } from 'react'
import {
  formatLongName,
  parseInstanceOptionsCloud,
  replaceSpaces,
  setTitle,
} from 'uiSrc/utils'
import { Pages } from 'uiSrc/constants'
import {
  InstanceRedisCloud,
  LoadedCloud,
  OAuthSocialAction,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { ColumnDefinition } from 'uiSrc/components/base/layout/table'
import {
  DatabaseListModules,
  DatabaseListOptions,
  RiTooltip,
} from 'uiSrc/components'
import styles from 'uiSrc/pages/autodiscover-cloud/redis-cloud-databases/styles.module.scss'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'
import {
  CellText,
  CopyPublicEndpointText,
  CopyTextContainer,
} from 'uiSrc/components/auto-discover'

export const useCloudDatabasesConfig = () => {
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
  const [selection, setSelection] = useState<InstanceRedisCloud[]>([])
  const onSelectionChange = (selected: InstanceRedisCloud) =>
    setSelection((previous) => {
      const isSelected = previous.some(
        (item) => item.databaseId === selected.databaseId,
      )
      if (isSelected) {
        return previous.filter(
          (item) => item.databaseId !== selected.databaseId,
        )
      }
      return [...previous, selected]
    })
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

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  const columns: ColumnDefinition<InstanceRedisCloud>[] = [
    getSelectionColumn({
      setSelection,
      onSelectionChange,
    }),
    {
      header: 'Database',
      id: 'name',
      accessorKey: 'name',
      enableSorting: true,
      size: 195,
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
              <CellText>{cellContent}</CellText>
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
      size: 170,
      cell: ({
        row: {
          original: { subscriptionId },
        },
      }) => (
        <CellText data-testid={`sub_id_${subscriptionId}`}>
          {subscriptionId}
        </CellText>
      ),
    },
    {
      header: 'Subscription',
      id: 'subscriptionName',
      accessorKey: 'subscriptionName',
      enableSorting: true,
      size: 300,
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
              <CellText>{cellContent}</CellText>
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
      size: 95,
      cell: ({
        row: {
          original: { subscriptionType },
        },
      }) => (
        <CellText>
          {RedisCloudSubscriptionTypeText[subscriptionType!] ?? '-'}
        </CellText>
      ),
    },
    {
      header: 'Status',
      id: 'status',
      accessorKey: 'status',
      enableSorting: true,
      size: 110,
      cell: ({
        row: {
          original: { status },
        },
      }) => <CellText className="column_status">{status}</CellText>,
    },
    {
      header: 'Endpoint',
      id: 'publicEndpoint',
      accessorKey: 'publicEndpoint',
      enableSorting: true,
      size: 310,
      cell: ({
        row: {
          original: { publicEndpoint },
        },
      }) => {
        const text = publicEndpoint
        return (
          <CopyTextContainer>
            <CopyPublicEndpointText>{text}</CopyPublicEndpointText>
            <RiTooltip
              position="right"
              content="Copy"
              anchorClassName="copyPublicEndpointTooltip"
            >
              <IconButton
                icon={CopyIcon}
                aria-label="Copy public endpoint"
                className="copyPublicEndpointBtn"
                onClick={() => handleCopy(text)}
              />
            </RiTooltip>
          </CopyTextContainer>
        )
      },
    },
    {
      header: 'Capabilities',
      id: 'modules',
      accessorKey: 'modules',
      enableSorting: true,
      size: 200,
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
      size: 180,
      cell: ({ row: { original: instance } }) => {
        const options = parseInstanceOptionsCloud(
          instance.databaseId,
          instances || [],
        )
        return <DatabaseListOptions options={options} />
      },
    },
  ]

  return {
    columns,
    selection,
    handleClose,
    handleBackAdding,
    handleAddInstances,
  }
}
