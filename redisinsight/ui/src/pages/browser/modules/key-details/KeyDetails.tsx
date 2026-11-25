import React, { useEffect } from 'react'
import { isNull } from 'lodash'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import {
  defaultSelectedKeyAction,
  fetchKeyInfo,
  keysSelector,
  selectedKeyDataSelector,
  selectedKeySelector,
  setSelectedKeyRefreshDisabled,
} from 'uiSrc/slices/browser/keys'
import { KeyTypes } from 'uiSrc/constants'
import { appContextBrowserKeyTabs } from 'uiSrc/slices/app/context'
import { useTranslation } from 'uiSrc/i18n'

import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { isEqualBuffers, isTruncatedString, Nullable } from 'uiSrc/utils'
import { NoKeySelected } from './components/no-key-selected'
import { DynamicTypeDetails } from './components/dynamic-type-details'

import styles from './styles.module.scss'

export interface Props {
  isFullScreen: boolean
  arePanelsCollapsed: boolean
  onToggleFullScreen: () => void
  onCloseKey: () => void
  onEditKey: (key: RedisResponseBuffer, newKey: RedisResponseBuffer) => void
  onRemoveKey: () => void
  keyProp: RedisResponseBuffer | null
  totalKeys: number
  keysLastRefreshTime: Nullable<number>
}

const KeyDetails = (props: Props) => {
  const { onCloseKey, keyProp, totalKeys, keysLastRefreshTime } = props

  const { instanceId } = useParams<{ instanceId: string }>()
  const { viewType } = useAppSelector(keysSelector)
  const {
    loading,
    error = '',
    data,
    viewFormat,
  } = useAppSelector(selectedKeySelector)
  const isKeySelected = !isNull(useAppSelector(selectedKeyDataSelector))
  const { type: keyType } = useAppSelector(selectedKeyDataSelector) ?? {
    type: KeyTypes.String,
  }
  const keyTabs = useAppSelector(appContextBrowserKeyTabs)

  const { t } = useTranslation()

  const dispatch = useAppDispatch()

  useEffect(() => {
    if (keyProp === null) return

    if (isTruncatedString(keyProp)) {
      dispatch(defaultSelectedKeyAction())
      return
    }

    dispatch(
      fetchKeyInfo(keyProp, undefined, (data) => {
        if (!data) return

        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            viewType,
            TelemetryEvent.BROWSER_KEY_VALUE_VIEWED,
            TelemetryEvent.TREE_VIEW_KEY_VALUE_VIEWED,
          ),
          eventData: {
            keyType: data.type,
            databaseId: instanceId,
            length: data.length,
            formatter: viewFormat,
          },
        })
      }),
    )

    dispatch(setSelectedKeyRefreshDisabled(false))
  }, [keyProp])

  const onCloseAddItemPanel = () => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_ADD_VALUE_CANCELLED,
        TelemetryEvent.TREE_VIEW_KEY_ADD_VALUE_CANCELLED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType,
      },
    })
  }

  const onOpenAddItemPanel = () => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_ADD_VALUE_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_ADD_VALUE_CLICKED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType,
      },
    })
  }

  // The key disappeared outside Browser and its tab remains available.
  const { removedReason = null } =
    keyTabs.find((tab) => isEqualBuffers(tab.key, keyProp)) ?? {}
  const removedMessage = t('browser.keyTabs.notFoundMessage')

  return (
    <div className={styles.container}>
      <div
        className={cx(styles.content, {
          [styles.contentActive]: data || error || loading,
        })}
      >
        {!isKeySelected && !loading ? (
          <NoKeySelected
            keyProp={keyProp}
            totalKeys={totalKeys}
            keysLastRefreshTime={keysLastRefreshTime}
            error={error || (removedReason ? removedMessage : '')}
            onClosePanel={onCloseKey}
          />
        ) : (
          <DynamicTypeDetails
            {...props}
            keyType={keyType}
            onOpenAddItemPanel={onOpenAddItemPanel}
            onCloseAddItemPanel={onCloseAddItemPanel}
          />
        )}
      </div>
    </div>
  )
}

export default React.memo(KeyDetails)
