import React, { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import {
  cloudSelector,
  resetDataRedisCloud,
  resetLoadedRedisCloud,
} from 'uiSrc/slices/instances/cloud'
import {
  AddRedisDatabaseStatus,
  InstanceRedisCloud,
  LoadedCloud,
  RedisCloudSubscriptionTypeText,
} from 'uiSrc/slices/interfaces'
import {
  formatLongName,
  handleCopy,
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
import { ColorText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import styles from './styles.module.scss'
import {
  CellText,
  CopyBtn,
  CopyPublicEndpointText,
  CopyTextContainer,
} from 'uiSrc/components/auto-discover'

export const colFactory = (
  instances: InstanceRedisCloud[] = [],
  instancesForOptions: InstanceRedisCloud[] = [],
): ColumnDef<InstanceRedisCloud>[] => {
  const shouldShowCapabilities = instances.some(
    (instance) => instance.modules?.length,
  )
  const shouldShowOptions = instances.some(
    (instance) =>
      instance.options &&
      Object.values(instance.options).filter(Boolean).length,
  )
  const columns: ColumnDef<InstanceRedisCloud>[] = [
    {
      header: 'Database',
      id: 'name',
      accessorKey: 'name',
      enableSorting: true,
      maxSize: 120,
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
      maxSize: 150,
    },
    {
      header: 'Subscription',
      id: 'subscriptionName',
      accessorKey: 'subscriptionName',
      enableSorting: true,
      maxSize: 270,
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
      size: 80,
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
      minSize: 250,
      maxSize: 310,
      cell: function PublicEndpoint({
        row: {
          original: { publicEndpoint },
        },
      }) {
        const text = publicEndpoint
        return (
          <CopyTextContainer>
            <RiTooltip
              delay={200}
              position="bottom"
              title="Endpoint"
              content={formatLongName(text)}
            >
              <CopyPublicEndpointText>{text}</CopyPublicEndpointText>
            </RiTooltip>

            <RiTooltip
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
      maxSize: 150,
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
      maxSize: 180,
      cell: function Options({ row: { original: instance } }) {
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
      minSize: 110,
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

  if (!shouldShowCapabilities) {
    columns.splice(
      columns.findIndex((col) => col.id === 'modules'),
      1,
    )
  }

  if (!shouldShowOptions) {
    columns.splice(
      columns.findIndex((col) => col.id === 'options'),
      1,
    )
  }

  return columns
}

export const useCloudDatabasesResultConfig = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const { data: instancesForOptions, dataAdded: instances } =
    useSelector(cloudSelector)

  useEffect(() => {
    if (!instances.length) {
      history.push(Pages.home)
    }
    setTitle('Redis Enterprise Databases Added')
  }, [instances.length])

  const handleClose = useCallback(() => {
    dispatch(resetDataRedisCloud())
    history.push(Pages.home)
  }, [dispatch, history])

  const handleBackAdding = useCallback(() => {
    dispatch(resetLoadedRedisCloud(LoadedCloud.InstancesAdded))
    history.push(Pages.home)
  }, [dispatch, history])

  const columns = useMemo(
    () => colFactory(instances || [], instancesForOptions || []),
    [instances, instancesForOptions],
  )

  return {
    instances,
    columns,
    handleClose,
    handleBackAdding,
  }
}
