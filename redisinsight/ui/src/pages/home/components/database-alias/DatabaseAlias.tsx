import React, { useState, useEffect, useContext } from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { toNumber } from 'lodash'
import { useHistory } from 'react-router'

import {
  ArrowLeftIcon,
  CopyIcon,
  DoubleChevronRightIcon,
  RiIcon,
} from 'uiBase/icons'
import { RiFlexItem, RiGrid, RiRow } from 'uiBase/layout'
import { RiIconButton, RiPrimaryButton, RiFormField } from 'uiBase/forms'
import { RiText } from 'uiBase/text'
import { RiTextInput } from 'uiBase/inputs'
import { BuildType } from 'uiSrc/constants/env'
import { appInfoSelector } from 'uiSrc/slices/app/info'
import { getDbIndex, Nullable } from 'uiSrc/utils'
import { Pages, Theme } from 'uiSrc/constants'
import { ThemeContext } from 'uiSrc/contexts/themeContext'
import InlineItemEditor from 'uiSrc/components/inline-item-editor/InlineItemEditor'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  changeInstanceAliasAction,
  checkConnectToInstanceAction,
  setConnectedInstanceId,
} from 'uiSrc/slices/instances/instances'
import { resetKeys } from 'uiSrc/slices/browser/keys'
import {
  appContextSelector,
  resetRdiContext,
  setAppContextInitialState,
} from 'uiSrc/slices/app/context'
import styles from './styles.module.scss'
import { RiTooltip } from 'uiBase/display'

export interface Props {
  alias: string
  database?: Nullable<number>
  isLoading: boolean
  onAliasEdited?: (value: string) => void
  isRediStack?: boolean
  isCloneMode: boolean
  id?: string
  setIsCloneMode: (value: boolean) => void
}

const DatabaseAlias = (props: Props) => {
  const {
    alias,
    database,
    id,
    onAliasEdited,
    isLoading,
    isRediStack,
    isCloneMode,
    setIsCloneMode,
  } = props

  const { server } = useSelector(appInfoSelector)
  const { contextInstanceId } = useSelector(appContextSelector)

  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(alias)

  const { theme } = useContext(ThemeContext)
  const history = useHistory()
  const dispatch = useDispatch()

  useEffect(() => {
    setValue(alias)
  }, [alias])

  const setEditMode = () => {
    setIsEditing(true)
  }

  const onChange = (value: string) => {
    isEditing && setValue(value)
  }

  const connectToInstance = () => {
    // reset rdi context
    dispatch(resetRdiContext())

    if (contextInstanceId && contextInstanceId !== id) {
      dispatch(resetKeys())
      dispatch(setAppContextInitialState())
    }
    dispatch(setConnectedInstanceId(id ?? ''))
    history.push(Pages.browser(id ?? ''))
  }

  const handleOpen = (event: any) => {
    event.stopPropagation()
    event.preventDefault()
    dispatch(checkConnectToInstanceAction(id, connectToInstance))
    // onOpen()
  }

  const handleClone = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsCloneMode(true)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_REQUESTED,
      eventData: {
        databaseId: id,
      },
    })
  }

  const handleApplyChanges = () => {
    setIsEditing(false)
    dispatch(
      changeInstanceAliasAction(
        id,
        value,
        () => {
          onAliasEdited?.(value)
        },
        () => setValue(alias),
      ),
    )
  }

  const handleCloneBack = () => {
    setIsCloneMode(false)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CANCELLED,
      eventData: {
        databaseId: id,
      },
    })
  }

  const handleDeclineChanges = (event?: React.MouseEvent<HTMLElement>) => {
    event?.stopPropagation()
    setValue(alias)
    setIsEditing(false)
  }

  return (
    <>
      <RiRow responsive={false} justify="start" align="center" gap="s">
        {isCloneMode && (
          <RiFlexItem>
            <RiIconButton
              onClick={handleCloneBack}
              icon={ArrowLeftIcon}
              className={styles.iconLeftArrow}
              aria-label="back"
              data-testid="back-btn"
            />
          </RiFlexItem>
        )}
        <RiFlexItem style={{ overflow: isEditing ? 'inherit' : 'hidden' }}>
          <RiRow justify="between" gap="s">
            {isRediStack && (
              <RiFlexItem>
                <RiTooltip
                  content={
                    <RiIcon
                      type={
                        theme === Theme.Dark
                          ? 'RediStackDarkLogoIcon'
                          : 'RediStackLightLogoIcon'
                      }
                      className={styles.tooltipLogo}
                      data-testid="tooltip-redis-stack-icon"
                    />
                  }
                  position="bottom"
                >
                  <RiIcon
                    type={
                      theme === Theme.Dark
                        ? 'RediStackDarkMinIcon'
                        : 'RediStackLightMinIcon'
                    }
                    className={styles.redistackIcon}
                    data-testid="redis-stack-icon"
                  />
                </RiTooltip>
              </RiFlexItem>
            )}
            <RiFlexItem
              grow
              onClick={setEditMode}
              data-testid="edit-alias-btn"
              style={{
                overflow: isEditing ? 'inherit' : 'hidden',
                maxWidth: '360px',
              }}
            >
              {!isCloneMode && (isEditing || isLoading) ? (
                <RiGrid responsive className="relative">
                  <RiFlexItem grow={1} className="fluid">
                    <InlineItemEditor
                      onApply={handleApplyChanges}
                      onDecline={handleDeclineChanges}
                      viewChildrenMode={!isEditing}
                      isLoading={isLoading}
                      isDisabled={!value}
                      declineOnUnmount={false}
                    >
                      <RiFormField
                        additionalText={
                          !isEditing ? (
                            <RiIcon type="EditIcon" color="informative400" />
                          ) : (
                            ''
                          )
                        }
                      >
                        <RiTextInput
                          name="alias"
                          id="alias"
                          className={cx(styles.input)}
                          placeholder="Enter Database Alias"
                          value={value}
                          maxLength={500}
                          loading={isLoading}
                          onChange={(value) => onChange(value)}
                          autoComplete="off"
                          data-testid="alias-input"
                        />
                      </RiFormField>
                    </InlineItemEditor>
                    <p className={styles.hiddenText}>{value}</p>
                  </RiFlexItem>
                </RiGrid>
              ) : (
                <RiText
                  className={cx(styles.alias, {
                    [styles.aliasEditing]: !isCloneMode,
                  })}
                >
                  <b className={styles.aliasText} data-testid="db-alias">
                    {isCloneMode && <span>Clone {alias}</span>}
                    {!isCloneMode && (
                      <span className={cx(styles.aliasTextEditing)}>
                        {alias}
                      </span>
                    )}
                  </b>
                  <b>{getDbIndex(toNumber(database))}</b>
                  {!isCloneMode && (
                    <RiIcon
                      type="EditIcon"
                      className={cx(styles.aliasEditIcon)}
                    />
                  )}
                </RiText>
              )}
            </RiFlexItem>
          </RiRow>
        </RiFlexItem>
      </RiRow>
      {!isCloneMode && (
        <RiRow gap="m" style={{ marginTop: 6, flexGrow: 0 }}>
          <RiFlexItem>
            <RiPrimaryButton
              size="s"
              icon={DoubleChevronRightIcon}
              aria-label="Connect to database"
              data-testid="connect-to-db-btn"
              className={styles.btnOpen}
              onClick={handleOpen}
            >
              Open
            </RiPrimaryButton>
          </RiFlexItem>
          {server?.buildType !== BuildType.RedisStack && (
            <RiFlexItem>
              <RiPrimaryButton
                size="s"
                icon={CopyIcon}
                aria-label="Clone database"
                data-testid="clone-db-btn"
                className={styles.btnClone}
                onClick={handleClone}
              >
                Clone
              </RiPrimaryButton>
            </RiFlexItem>
          )}
        </RiRow>
      )}
    </>
  )
}

export default DatabaseAlias
