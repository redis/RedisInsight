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
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  formatLongName,
  handleCopy,
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
import {
  ColumnDef,
  RowSelectionState,
} from 'uiSrc/components/base/layout/table'
import {
  DatabaseListModules,
  DatabaseListOptions,
  RiTooltip,
} from 'uiSrc/components'
import styles from 'uiSrc/pages/autodiscover-cloud/redis-cloud-databases/styles.module.scss'
import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'
import {
  CellText,
  CopyBtn,
  CopyPublicEndpointText,
  CopyTextContainer,
  StatusColumnText,
} from 'uiSrc/components/auto-discover'

export const colFactory = (instances: InstanceRedisCloud[]) => {
  const columns: ColumnDef<InstanceRedisCloud>[] = [
    getSelectionColumn<InstanceRedisCloud>(),
    {
      header: 'Database',
      id: 'name',
      accessorKey: 'name',
      enableSorting: true,
      maxSize: 150,
      cell: ({
        row: {
          original: { name },
        },
      }) => {
        const cellContent = replaceSpaces(name.substring(0, 200))
        return (
          <div role="presentation" data-testid={`db_name_${name}`}>
            <RiTooltip
              delay={200}
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
      maxSize: 120,
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
      minSize: 200,
      cell: ({
        row: {
          original: { subscriptionName: name },
        },
      }) => {
        const cellContent = replaceSpaces(name.substring(0, 200))
        return (
          <div role="presentation">
            <RiTooltip
              delay={200}
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
      maxSize: 100,
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
      maxSize: 100,
      cell: ({
        row: {
          original: { status },
        },
      }) => <StatusColumnText>{status}</StatusColumnText>,
    },
    {
      header: 'Endpoint',
      id: 'publicEndpoint',
      accessorKey: 'publicEndpoint',
      enableSorting: true,
      minSize: 200,
      cell: ({
        row: {
          original: { publicEndpoint },
        },
      }) => {
        const text = publicEndpoint
        return (
          <CopyTextContainer>
            <RiTooltip
              delay={200}
              position="bottom"
              title="Endpoint"
              anchorClassName="truncateText"
              content={formatLongName(text)}
            >
              <CopyPublicEndpointText>{text}</CopyPublicEndpointText>
            </RiTooltip>

            <RiTooltip
              delay={200}
              position="right"
              content="Copy"
              anchorClassName="copyPublicEndpointTooltip"
            >
              <CopyBtn
                aria-label="Copy public endpoint"
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
      maxSize: 120,
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
      maxSize: 120,
      cell: ({ row: { original: instance } }) => {
        const options = parseInstanceOptionsCloud(
          instance.databaseId,
          instances || [],
        )
        return <DatabaseListOptions options={options} />
      },
    },
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
