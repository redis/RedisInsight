import React from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { RiFlexItem, RiRow, ColumnDefinition } from 'uiBase/layout'
import { RiIconButton } from 'uiBase/forms'
import { CopyIcon, RiIcon } from 'uiBase/icons'
import { RiColorText, RiText } from 'uiBase/text'
import { Pages } from 'uiSrc/constants'
import {
  addInstancesRedisCluster,
  clusterSelector,
  resetDataRedisCluster,
  resetInstancesRedisCluster,
} from 'uiSrc/slices/instances/cluster'
import {
  formatLongName,
  Maybe,
  parseInstanceOptionsCluster,
  setTitle,
} from 'uiSrc/utils'
import {
  AddRedisDatabaseStatus,
  InstanceRedisCluster,
} from 'uiSrc/slices/interfaces'
import {
  DatabaseListModules,
  DatabaseListOptions,
  RiTooltip,
} from 'uiSrc/components'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import RedisClusterDatabases from './RedisClusterDatabases'
import RedisClusterDatabasesResult from './RedisClusterDatabasesResult'

import styles from './styles.module.scss'

const RedisClusterDatabasesPage = () => {
  const dispatch = useDispatch()
  const history = useHistory()

  const {
    credentials,
    data: instances,
    dataAdded: instancesAdded,
  } = useSelector(clusterSelector)
  setTitle('Auto-Discover Redis Enterprise Databases')

  const sendCancelEvent = () => {
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_RE_CLUSTER_AUTODISCOVERY_CANCELLED,
    })
  }

  const handleClose = (sendEvent = true) => {
    sendEvent && sendCancelEvent()
    dispatch(resetDataRedisCluster())
    history.push(Pages.home)
  }

  const handleBackAdding = (sendEvent = true) => {
    sendEvent && sendCancelEvent()
    dispatch(resetInstancesRedisCluster())
    history.push(Pages.home)
  }

  const handleAddInstances = (uids: Maybe<number>[]) => {
    dispatch(addInstancesRedisCluster({ uids, credentials }))
  }

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  const columns: ColumnDefinition<InstanceRedisCluster>[] = [
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
        const cellContent = name
          .substring(0, 200)
          .replace(/\s\s/g, '\u00a0\u00a0')
        return (
          <div role="presentation" data-testid={`db_name_${name}`}>
            <RiTooltip
              position="bottom"
              title="Database"
              className={styles.tooltipColumnName}
              content={formatLongName(name)}
            >
              <RiText>{cellContent}</RiText>
            </RiTooltip>
          </div>
        )
      },
    },
    {
      header: 'Status',
      id: 'status',
      accessorKey: 'status',
      enableSorting: true,
    },
    {
      header: 'Endpoint',
      id: 'dnsName',
      accessorKey: 'dnsName',
      enableSorting: true,
      cell: ({
        row: {
          original: { dnsName, port },
        },
      }) => {
        const text = `${dnsName}:${port}`
        return (
          !!dnsName && (
            <div className="host_port">
              <RiText className="copyHostPortText">{text}</RiText>
              <RiTooltip
                position="right"
                content="Copy"
                anchorClassName="copyHostPortTooltip"
              >
                <RiIconButton
                  icon={CopyIcon}
                  aria-label="Copy host:port"
                  className="copyHostPortBtn"
                  onClick={() => handleCopy(text)}
                />
              </RiTooltip>
            </div>
          )
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
            modules={instance?.modules?.map((name) => ({ name }))}
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
        const options = parseInstanceOptionsCluster(
          instance?.uid,
          instances || [],
        )
        return <DatabaseListOptions options={options} />
      },
    },
  ]

  const messageColumn: ColumnDefinition<InstanceRedisCluster> = {
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
            <RiTooltip position="left" title="Error" content={messageAdded}>
              <RiRow align="center" gap="s">
                <RiFlexItem>
                  <RiIcon type="ToastDangerIcon" color="danger600" />
                </RiFlexItem>

                <RiFlexItem>
                  <RiColorText
                    color="danger"
                    className="flex-row euiTextAlign--center"
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
  }

  const columnsResult: ColumnDefinition<InstanceRedisCluster>[] = [...columns]
  columnsResult.push(messageColumn)

  if (instancesAdded.length) {
    return (
      <RedisClusterDatabasesResult
        onView={handleClose}
        onBack={handleBackAdding}
        columns={columnsResult}
      />
    )
  }

  return (
    <RedisClusterDatabases
      onClose={handleClose}
      onBack={handleBackAdding}
      onSubmit={handleAddInstances}
      columns={columns}
    />
  )
}

export default RedisClusterDatabasesPage
