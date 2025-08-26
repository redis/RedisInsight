import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

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
  RiTooltip,
} from 'uiSrc/components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { CopyIcon } from 'uiSrc/components/base/icons'
import { ColorText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { ColumnDefinition } from 'uiSrc/components/base/layout/table'
import RedisCloudDatabasesResult from './RedisCloudDatabasesResult'

import styles from './styles.module.scss'
import {
  CellText,
  CopyPublicEndpointText,
  CopyTextContainer,
} from 'uiSrc/components/auto-discover'

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
      size: 195,
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
    },
    {
      header: 'Subscription',
      id: 'subscriptionName',
      accessorKey: 'subscriptionName',
      enableSorting: true,
      size: 300,
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
      }) => RedisCloudSubscriptionTypeText[subscriptionType!] ?? '-',
    },
    {
      header: 'Status',
      id: 'status',
      accessorKey: 'status',
      enableSorting: true,
      size: 95,
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
      cell: function PublicEndpoint({
        row: {
          original: { publicEndpoint },
        },
      }) {
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
      size: 180,
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
      size: 110,
      cell: function Message({
        row: {
          original: { statusAdded, messageAdded },
        },
      }) {
        return (
          <>
            {statusAdded === AddRedisDatabaseStatus.Success ? (
              <CellText>{messageAdded}</CellText>
            ) : (
              <RiTooltip
                position="left"
                title="Error"
                content={messageAdded}
                anchorClassName="truncateText"
              >
                <Row align="center" gap="s">
                  <FlexItem>
                    <RiIcon type="ToastDangerIcon" color="danger600" />
                  </FlexItem>

                  <FlexItem>
                    <ColorText color="danger" className="flex-row" size="S">
                      Error
                    </ColorText>
                  </FlexItem>
                </Row>
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
