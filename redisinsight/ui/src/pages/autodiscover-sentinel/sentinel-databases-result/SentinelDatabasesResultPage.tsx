import { pick } from 'lodash'
import { useHistory } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  LoadedSentinel,
  AddRedisDatabaseStatus,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'
import {
  sentinelSelector,
  resetLoadedSentinel,
  updateMastersSentinel,
  createMastersSentinelAction,
  resetDataSentinel,
} from 'uiSrc/slices/instances/sentinel'
import { removeEmpty, setTitle } from 'uiSrc/utils'
import { ApiStatusCode, Pages } from 'uiSrc/constants'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'
import { InputFieldSentinel, RiTooltip } from 'uiSrc/components'
import validationErrors from 'uiSrc/constants/validationErrors'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'

import { RiIconButton, RiPrimaryButton } from 'uiSrc/components/base/forms'
import { InfoIcon, CopyIcon, RiIcon } from 'uiSrc/components/base/icons'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { ColumnDefinition } from 'uiSrc/components/base/layout'
import { RiLoader } from 'uiSrc/components/base/display'
import SentinelDatabasesResult from './components'

import styles from '../styles.module.scss'

const SentinelDatabasesResultPage = () => {
  const [items, setItems] = useState<ModifiedSentinelMaster[]>([])
  const [isInvalid, setIsInvalid] = useState(true)

  const { data: masters } = useSelector(sentinelSelector)

  const countSuccessAdded = masters.filter(
    ({ status }) => status === AddRedisDatabaseStatus.Success,
  )?.length

  const dispatch = useDispatch()
  const history = useHistory()

  setTitle('Redis Sentinel Primary Groups Added')

  useEffect(() => {
    if (!masters.length) {
      history.push(Pages.home)
    }

    dispatch(resetLoadedSentinel(LoadedSentinel.MastersAdded))
  }, [])

  useEffect(() => {
    if (masters.length) {
      setIsInvalid(true)
      setItems(masters)
    }
  }, [masters])

  const handleBackAdditing = () => {
    dispatch(resetLoadedSentinel(LoadedSentinel.MastersAdded))
    history.push(Pages.home)
  }

  const handleViewDatabases = () => {
    dispatch(resetDataSentinel())
    history.push(Pages.home)
  }

  const handleCopy = (text = '') => {
    navigator.clipboard.writeText(text)
  }

  const handleAddInstance = (masterName: string) => {
    const instance: ModifiedSentinelMaster = {
      ...removeEmpty(items.find((item) => item.name === masterName)),
      loading: true,
    }

    const updatedItems = items.map((item) =>
      item.name === masterName ? instance : item,
    )

    const pikedInstance = [
      pick(instance, 'alias', 'name', 'username', 'password', 'db'),
    ]

    dispatch(updateMastersSentinel(updatedItems))
    dispatch(createMastersSentinelAction(pikedInstance))
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
      header: 'Result',
      id: 'message',
      accessorKey: 'message',
      enableSorting: true,
      cell: ({
        row: {
          original: { status, message, name, loading = false },
        },
      }) => (
        <div data-testid={`status_${name}_${status}`}>
          {loading && <RiLoader />}
          {!loading && status === AddRedisDatabaseStatus.Success && (
            <Text>{message}</Text>
          )}
          {!loading && status !== AddRedisDatabaseStatus.Success && (
            <RiTooltip position="right" title="Error" content={message}>
              <ColorText color="danger" style={{ cursor: 'pointer' }}>
                Error&nbsp;
                <RiIcon type="ToastDangerIcon" color="danger600" />
              </ColorText>
            </RiTooltip>
          )}
        </div>
      ),
    },
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
      cell: ({
        row: {
          original: { id, alias, error, loading = false, status },
        },
      }) => {
        if (
          error?.statusCode !== ApiStatusCode.Unauthorized ||
          status === AddRedisDatabaseStatus.Success
        ) {
          return alias
        }
        return (
          <InputFieldSentinel
            name={`alias-${id}`}
            value={alias}
            placeholder="Database"
            disabled={loading}
            className={styles.input}
            inputType={SentinelInputFieldType.Text}
            onChangedInput={handleChangedInput}
            maxLength={500}
          />
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
            <Text className="copyHostPortText">{text}</Text>
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
      cell: ({
        row: {
          original: { username, id, loading = false, error, status },
        },
      }) => {
        if (
          error?.statusCode !== ApiStatusCode.Unauthorized ||
          status === AddRedisDatabaseStatus.Success
        ) {
          return username || <i>Default</i>
        }
        return (
          <div role="presentation" style={{ position: 'relative' }}>
            <InputFieldSentinel
              isText
              isInvalid={isInvalid}
              value={username}
              name={`username-${id}`}
              className={styles.input}
              placeholder="Enter Username"
              disabled={loading}
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
      cell: ({
        row: {
          original: { password, id, error, loading = false, status },
        },
      }) => {
        if (
          error?.statusCode !== ApiStatusCode.Unauthorized ||
          status === AddRedisDatabaseStatus.Success
        ) {
          return password ? '************' : <i>not assigned</i>
        }
        return (
          <div role="presentation" style={{ position: 'relative' }}>
            <InputFieldSentinel
              isInvalid={isInvalid}
              value={password}
              name={`password-${id}`}
              className={styles.input}
              placeholder="Enter Password"
              disabled={loading}
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
      cell: ({
        row: {
          original: { db, id, loading = false, status, error },
        },
      }) => {
        if (status === AddRedisDatabaseStatus.Success) {
          return db || <i>not assigned</i>
        }
        const isDBInvalid = error?.statusCode === ApiStatusCode.BadRequest
        return (
          <div role="presentation" style={{ position: 'relative' }}>
            <InputFieldSentinel
              min={0}
              disabled={loading}
              className={styles.dbInfo}
              value={`${db}` || '0'}
              name={`db-${id}`}
              isInvalid={isDBInvalid}
              placeholder="Enter Index"
              inputType={SentinelInputFieldType.Number}
              onChangedInput={handleChangedInput}
            />
          </div>
        )
      },
    },
  ]

  if (countSuccessAdded !== items.length) {
    const columnActions: ColumnDefinition<ModifiedSentinelMaster> = {
      header: '',
      id: 'actions',
      accessorKey: 'actions',
      cell: ({
        row: {
          original: { name, error, alias, loading = false },
        },
      }) => {
        const isDisabled = !alias
        if (
          error?.statusCode !== ApiStatusCode.Unauthorized &&
          !ApiEncryptionErrors.includes(error?.name) &&
          error?.statusCode !== ApiStatusCode.BadRequest
        ) {
          return ''
        }
        return (
          <div role="presentation">
            <RiTooltip
              position="top"
              anchorClassName="euiToolTip__btn-disabled"
              title={isDisabled ? validationErrors.REQUIRED_TITLE(1) : null}
              content={isDisabled ? <span>Database Alias</span> : null}
            >
              <RiPrimaryButton
                size="s"
                disabled={isDisabled}
                loading={loading}
                onClick={() => handleAddInstance(name)}
                icon={isDisabled ? InfoIcon : undefined}
              >
                Add Primary Group
              </RiPrimaryButton>
            </RiTooltip>
          </div>
        )
      },
    }

    columns.splice(1, 0, columnActions)
  }

  return (
    <SentinelDatabasesResult
      columns={columns}
      masters={items}
      countSuccessAdded={countSuccessAdded}
      onBack={handleBackAdditing}
      onViewDatabases={handleViewDatabases}
    />
  )
}

export default SentinelDatabasesResultPage
