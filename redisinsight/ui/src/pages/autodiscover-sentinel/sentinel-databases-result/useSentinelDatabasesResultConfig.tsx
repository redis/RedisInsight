import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { ApiStatusCode, Pages } from 'uiSrc/constants'
import {
  createMastersSentinelAction,
  resetDataSentinel,
  resetLoadedSentinel,
  sentinelSelector,
  updateMastersSentinel,
} from 'uiSrc/slices/instances/sentinel'
import {
  AddRedisDatabaseStatus,
  LoadedSentinel,
  ModifiedSentinelMaster,
} from 'uiSrc/slices/interfaces'
import { removeEmpty, setTitle } from 'uiSrc/utils'
import { pick } from 'lodash'
import { ColumnDefinition } from 'uiSrc/components/base/layout/table'
import { Loader } from 'uiSrc/components/base/display'
import { RiTooltip } from 'uiSrc/components/base/tooltip'
import { ColorText } from 'uiSrc/components/base/text'
import { InfoIcon, RiIcon } from 'uiSrc/components/base/icons'
import { InputFieldSentinel } from 'uiSrc/components'
import { SentinelInputFieldType } from 'uiSrc/components/input-field-sentinel/InputFieldSentinel'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { ApiEncryptionErrors } from 'uiSrc/constants/apiErrors'
import validationErrors from 'uiSrc/constants/validationErrors'
import styles from '../styles.module.scss'
import {
  CellText,
  CopyBtn,
  CopyPublicEndpointText,
  CopyTextContainer,
} from 'uiSrc/components/auto-discover'

// Define an interface for the error object
interface ErrorWithStatusCode {
  statusCode?: number
  name?: string
  [key: string]: any
}

function errorNotAuth(
  error?: string | ErrorWithStatusCode | null,
  status?: AddRedisDatabaseStatus,
) {
  return (
    (typeof error === 'object' &&
      error?.statusCode !== ApiStatusCode.Unauthorized) ||
    status === AddRedisDatabaseStatus.Success
  )
}

export const useSentinelDatabasesResultConfig = () => {
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

  const handleBackAdding = () => {
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
      size: 110,
      cell: ({
        row: {
          original: { status, message, name, loading = false },
        },
      }) => (
        <div data-testid={`status_${name}_${status}`}>
          {loading && <Loader />}
          {!loading && status === AddRedisDatabaseStatus.Success && (
            <CellText size="S">{message}</CellText>
          )}
          {!loading && status !== AddRedisDatabaseStatus.Success && (
            <RiTooltip position="right" title="Error" content={message}>
              <ColorText size="S" color="danger" style={{ cursor: 'pointer' }}>
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
      size: 175,
      cell: ({
        row: {
          original: { name },
        },
      }) => <CellText data-testid={`primary-group_${name}`}>{name}</CellText>,
    },
    {
      header: 'Database Alias*',
      id: 'alias',
      accessorKey: 'alias',
      enableSorting: true,
      size: 300,
      cell: ({
        row: {
          original: { id, alias, error, loading = false, status },
        },
      }) => {
        if (errorNotAuth(error, status)) {
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
      size: 190,
      cell: ({
        row: {
          original: { host, port },
        },
      }) => {
        const text = `${host}:${port}`
        return (
          <CopyTextContainer>
            <CopyPublicEndpointText className="copyHostPortText">
              {text}
            </CopyPublicEndpointText>
            <RiTooltip
              position="right"
              content="Copy"
              anchorClassName="copyPublicEndpointTooltip"
            >
              <CopyBtn
                aria-label="Copy address"
                className="copyPublicEndpointBtn"
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
      size: 135,
    },
    {
      header: 'Username',
      id: 'username',
      accessorKey: 'username',
      size: 285,
      cell: ({
        row: {
          original: { username, id, loading = false, error, status },
        },
      }) => {
        if (errorNotAuth(error, status)) {
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
      size: 285,
      cell: ({
        row: {
          original: { password, id, error, loading = false, status },
        },
      }) => {
        if (errorNotAuth(error, status)) {
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
      size: 170,
      cell: ({
        row: {
          original: { db, id, loading = false, status, error },
        },
      }) => {
        if (status === AddRedisDatabaseStatus.Success) {
          return db || <i>not assigned</i>
        }
        const isDBInvalid =
          typeof error === 'object' &&
          error !== null &&
          'statusCode' in error &&
          error.statusCode === ApiStatusCode.BadRequest
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
      size: 200,
      cell: ({
        row: {
          original: { name, error, alias, loading = false },
        },
      }) => {
        const isDisabled = !alias
        if (
          typeof error === 'object' &&
          error !== null &&
          'statusCode' in error &&
          error?.statusCode !== ApiStatusCode.Unauthorized &&
          !ApiEncryptionErrors.includes(error?.name || '') &&
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
              <PrimaryButton
                size="s"
                disabled={isDisabled}
                loading={loading}
                onClick={() => handleAddInstance(name)}
                icon={isDisabled ? InfoIcon : undefined}
              >
                Add Primary Group
              </PrimaryButton>
            </RiTooltip>
          </div>
        )
      },
    }

    columns.splice(1, 0, columnActions)
  }

  return {
    columns,
    items,
    countSuccessAdded,
    handleBackAdding,
    handleViewDatabases,
  }
}
