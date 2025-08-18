import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { RiFlexItem, RiRow, ColumnDefinition } from 'uiBase/layout'
import { RiIconButton } from 'uiBase/forms'
import { CopyIcon, RiIcon } from 'uiBase/icons'
import { RiColorText, RiText } from 'uiBase/text'
import { RiTooltip } from 'uiBase/display'
import { Pages } from 'uiSrc/constants'
import {
  cloudSelector,
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import {
  InstanceRedisCloud,
  AddRedisDatabaseStatus,
  LoadedCloud,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import {
  formatLongName,
  parseInstanceOptionsCloud,
  replaceSpaces,
  setTitle,
} from 'uiSrc/utils'
import {
  DatabaseListModules,
  DatabaseListOptions,
} from 'uiSrc/components'
import RedisCloudDatabasesResult from './RedisCloudDatabasesResult'

import styles from './styles.module.scss'

const RedisCloudDatabasesResultPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const { data: instancesForOptions, dataAdded: instances } =
    useSelector(cloudSelector)

  setTitle('Redis Enterprise Databases Added')

  useEffect(() => {
    if (!instances.length) {
      history.push(Pages.home)
    }
  }, [])

  const handleClose = () => {
    dispatch(resetDataRedisCloud())
    history.push(Pages.home)
  }

  const handleBackAdditing = () => {
    dispatch(resetLoadedRedisCloud(LoadedCloud.InstancesAdded))
    history.push(Pages.home)
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
      cell: function InstanceCell({
        row: {
          original: { name },
        },
      }) {
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
              <RiText>{cellContent}</RiText>
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
    },
    {
      header: 'Subscription',
      id: 'subscriptionName',
      accessorKey: 'subscriptionName',
      enableSorting: true,
      cell: function SubscriptionCell({
        row: {
          original: { subscriptionName: name },
        },
      }) {
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
              <RiText>{cellContent}</RiText>
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
      cell: function PublicEndpoint({
        row: {
          original: { publicEndpoint },
        },
      }) {
        const text = publicEndpoint
        return (
          <div className="public_endpoint">
            <RiText className="copyPublicEndpointText">{text}</RiText>
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
            modules={instance.modules?.map((name) => ({ name }))}
          />
        )
      },
    },
    {
      header: 'Options',
      id: 'options',
      accessorKey: 'options',
      enableSorting: true,
      cell: function Opitions({ row: { original: instance } }) {
        const options = parseInstanceOptionsCloud(
          instance.databaseId,
          instancesForOptions,
        )
        return <DatabaseListOptions options={options} />
      },
    },
    {
      header: 'Result',
      id: 'messageAdded',
      accessorKey: 'messageAdded',
      enableSorting: true,
      cell: function Message({
        row: {
          original: { statusAdded, messageAdded },
        },
      }) {
        return (
          <>
            {statusAdded === AddRedisDatabaseStatus.Success ? (
              <RiText>{messageAdded}</RiText>
            ) : (
              <RiTooltip
                position="left"
                title="Error"
                content={messageAdded}
                anchorClassName="truncateText"
              >
                <RiRow align="center" gap="s">
                  <RiFlexItem>
                    <RiIcon type="ToastDangerIcon" color="danger600" />
                  </RiFlexItem>

                  <RiFlexItem>
                    <RiColorText
                      color="danger"
                      className="flex-row"
                    >
                      Error
                    </RiColorText>
                  </RiFlexItem>
                </RiRow>
              </RiTooltip>
            )}
          </>
        )
      },
    },
  ]

  return (
    <RedisCloudDatabasesResult
      columns={columns}
      onView={handleClose}
      onBack={handleBackAdditing}
    />
  )
}

export default RedisCloudDatabasesResultPage
