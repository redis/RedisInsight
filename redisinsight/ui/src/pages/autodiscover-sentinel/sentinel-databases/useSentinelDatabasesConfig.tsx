import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { map, pick } from 'lodash'

import { LoadedSentinel, ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'
import {
  createMastersSentinelAction,
  resetDataSentinel,
  resetLoadedSentinel,
  sentinelSelector,
  updateMastersSentinel,
} from 'uiSrc/slices/instances/sentinel'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { Pages } from 'uiSrc/constants'
import { handleCopy, setTitle } from 'uiSrc/utils'
import { CreateSentinelDatabaseDto } from 'apiSrc/modules/redis-sentinel/dto/create.sentinel.database.dto'
import { getSelectionColumn } from 'uiSrc/pages/autodiscover-cloud/utils'
import { InputFieldSentinel, RiTooltip } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import {
  CopyBtn,
  CopyPublicEndpointText,
  CopyTextContainer,
} from 'uiSrc/components/auto-discover'
import { ColumnDef } from 'uiSrc/components/base/layout/table'
import { RiIcon } from 'uiSrc/components/base/icons'

import styles from '../styles.module.scss'

export const useSentinelDatabasesConfig = () => {
  const [items, setItems] = useState<ModifiedSentinelMaster[]>([])

  const { data: masters } = useSelector(sentinelSelector)

  const dispatch = useDispatch()
  const history = useHistory()
  const [selection, setSelection] = useState<ModifiedSentinelMaster[]>([])
  const updateSelection = (
    selected: ModifiedSentinelMaster[],
    masters: ModifiedSentinelMaster[],
  ) => {
    return selected.map(
      (select) => masters.find((master) => master.id === select.id) ?? select,
    )
  }
  const onSelectionChange = (selected: ModifiedSentinelMaster) =>
    setSelection((previous) => {
      const isSelected = previous.some((item) => item.id === selected.id)
      if (isSelected) {
        return previous.filter((item) => item.id !== selected.id)
      }
      return [...previous, selected]
    })

  useEffect(() => {
    if (masters.length) {
      setItems(masters)
      setSelection((prevState) => updateSelection(prevState, masters))
    }
  }, [masters])

  setTitle('Auto-Discover Redis Sentinel Primary Groups')

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

  const columns: ColumnDef<ModifiedSentinelMaster>[] = [
    getSelectionColumn({
      setSelection,
      onSelectionChange,
    }),
    {
      header: 'Primary Group',
      id: 'name',
      accessorKey: 'name',
      enableSorting: true,
      size: 211,
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
      size: 285,
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
      size: 210,
      cell: ({
        row: {
          original: { host, port },
        },
      }) => {
        const text = `${host}:${port}`
        return (
          <CopyTextContainer>
            <CopyPublicEndpointText>{text}</CopyPublicEndpointText>
            <RiTooltip
              position="right"
              content="Copy"
              anchorClassName="copyPublicEndpointTooltip"
            >
              <CopyBtn
                aria-label="Copy public endpoint"
                onClick={() => handleCopy(text)}
                tabIndex={-1}
              />
            </RiTooltip>
          </CopyTextContainer>
        )
      },
    },
    {
      header: '# of replicas',
      id: 'numberOfSlaves',
      accessorKey: 'numberOfSlaves',
      enableSorting: true,
      size: 130,
    },
    {
      header: 'Username',
      id: 'username',
      accessorKey: 'username',
      size: 285,
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
      size: 285,
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
      size: 200,
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
  return {
    columns,
    selection,
    items,
    handleClose,
    handleBackAdditing,
    handleAddInstances,
  }
}
