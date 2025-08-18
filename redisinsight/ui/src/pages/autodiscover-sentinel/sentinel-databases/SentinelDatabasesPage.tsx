import React, { useEffect, useState } from 'react'
import { map, pick } from 'lodash'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { RiIconButton } from 'uiBase/forms'
import { CopyIcon, RiIcon } from 'uiBase/icons'
import { RiText } from 'uiBase/text'
import { ColumnDefinition } from 'uiBase/layout'
import { RiTooltip } from 'uiBase/display'
import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  createMastersSentinelAction,
  resetDataSentinel,
  resetLoadedSentinel,
  sentinelSelector,
  updateMastersSentinel,
} from 'uiSrc/slices/instances/sentinel'
import { LoadedSentinel, ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { CreateSentinelDatabaseDto } from 'apiSrc/modules/redis-sentinel/dto/create.sentinel.database.dto'

import SentinelDatabases from './components'

import styles from '../styles.module.scss'

const SentinelDatabasesPage = () => {
  const [items, setItems] = useState<ModifiedSentinelMaster[]>([])

  const { data: masters } = useSelector(sentinelSelector)

  const dispatch = useDispatch()
  const history = useHistory()

  setTitle('Auto-Discover Redis Sentinel Primary Groups')

  useEffect(() => {
    if (masters.length) {
      setItems(masters)
    }
  }, [masters])

  const sendCancelEvent = () => {
    sendEventTelemetry({
      event:
        TelemetryEvent.CONFIG_DATABASES_REDIS_SENTINEL_AUTODISCOVERY_CANCELLED,
    })
  }

  const handleClose = () => {
    sendCancelEvent()
    dispatch(resetDataSentinel())
    history.push(Pages.home)
  }

  const handleBackAdditing = () => {
    sendCancelEvent()
    dispatch(resetLoadedSentinel(LoadedSentinel.Masters))
    history.push(Pages.home)
  }

  const handleAddInstances = (databases: ModifiedSentinelMaster[]) => {
    const pikedDatabases = map(databases, (i) => {
      const database: CreateSentinelDatabaseDto = {
        name: i.name,
        alias: i.alias || i.name,
      }
      if (i.username) {
        database.username = i.username
      }
      if (i.password) {
        database.password = i.password
      }
      if (i.db) {
        database.db = i.db
      }
      return pick(database, 'alias', 'name', 'username', 'password', 'db')
    })

    dispatch(updateMastersSentinel(databases))
    dispatch(
      createMastersSentinelAction(pikedDatabases, () =>
        history.push(Pages.sentinelDatabasesResult),
      ),
    )
  }

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  const handleChangedInput = (name: string, value: string) => {
    const [field, id] = name.split('-')

    setItems((items) =>
      items.map((item) => {
        if (item.id !== id) {
          return item
        }

        return { ...item, [field]: value }
      }),
    )
  }

  const columns: ColumnDefinition<ModifiedSentinelMaster>[] = [
    {
      header: 'Primary Group',
      id: 'name',
      accessorKey: 'name',
      enableSorting: true,
      cell: ({
        row: {
          original: { name },
        },
      }) => <span data-testid={`primary-group_${name}`}>{name}</span>,
    },
    {
      header: 'Database Alias*',
      id: 'alias',
      accessorKey: 'alias',
      enableSorting: true,
      cell: function InstanceAliasCell({
        row: {
          original: { id, alias, name },
        },
      }) {
        return (
          <div role="presentation">
            <InputFieldSentinel
              name={`alias-${id}`}
              value={alias || name}
              className={styles.input}
              placeholder="Enter Database Alias"
              inputType={SentinelInputFieldType.Text}
              onChangedInput={handleChangedInput}
              maxLength={500}
            />
          </div>
        )
      },
    },
    {
      header: 'Address',
      id: 'host',
      accessorKey: 'host',
      enableSorting: true,
      cell: ({
        row: {
          original: { host, port },
        },
      }) => {
        const text = `${host}:${port}`
        return (
          <div className="host_port">
            <RiText className="copyHostPortText">{text}</RiText>
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
                tabIndex={-1}
              />
            </RiTooltip>
          </div>
        )
      },
    },
    {
      header: '# of replicas',
      id: 'numberOfSlaves',
      accessorKey: 'numberOfSlaves',
      enableSorting: true,
    },
    {
      header: 'Username',
      id: 'username',
      accessorKey: 'username',
      cell: function UsernameCell({
        row: {
          original: { username, id },
        },
      }) {
        return (
          <div role="presentation">
            <InputFieldSentinel
              value={username}
              name={`username-${id}`}
              className={styles.input}
              placeholder="Enter Username"
              inputType={SentinelInputFieldType.Text}
              onChangedInput={handleChangedInput}
            />
          </div>
        )
      },
    },
    {
      header: 'Password',
      id: 'password',
      accessorKey: 'password',
      cell: function PasswordCell({
        row: {
          original: { password, id },
        },
      }) {
        return (
          <div role="presentation">
            <InputFieldSentinel
              value={password}
              name={`password-${id}`}
              className={styles.input}
              placeholder="Enter Password"
              inputType={SentinelInputFieldType.Password}
              onChangedInput={handleChangedInput}
            />
          </div>
        )
      },
    },
    {
      header: 'Database Index',
      id: 'db',
      accessorKey: 'db',
      cell: function IndexCell({
        row: {
          original: { db = 0, id },
        },
      }) {
        return (
          <div role="presentation">
            <InputFieldSentinel
              min={0}
              className={styles.dbInfo}
              value={`${db}` || '0'}
              name={`db-${id}`}
              placeholder="Enter Index"
              inputType={SentinelInputFieldType.Number}
              onChangedInput={handleChangedInput}
              append={
                <RiTooltip
                  anchorClassName="inputAppendIcon"
                  position="left"
                  content="Select the Redis logical database to work with in Browser and Workbench."
                >
                  <RiIcon type="InfoIcon" style={{ cursor: 'pointer' }} />
                </RiTooltip>
              }
            />
          </div>
        )
      },
    },
  ]

  return (
    <SentinelDatabases
      columns={columns}
      masters={items}
      onClose={handleClose}
      onBack={handleBackAdditing}
      onSubmit={handleAddInstances}
    />
  )
}

export default SentinelDatabasesPage
