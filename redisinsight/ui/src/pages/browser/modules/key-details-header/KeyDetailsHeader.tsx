import React, { ReactElement } from 'react'
import { isUndefined } from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import AutoSizer from 'react-virtualized-auto-sizer'

import { RiFlexItem, RiRow } from 'uiBase/layout'
import { CancelSlimIcon } from 'uiBase/icons'
import { RiIconButton } from 'uiBase/forms'
import {
  GroupBadge,
  AutoRefresh,
  FullScreen,
  RiLoadingContent,
  RiTooltip,
} from 'uiSrc/components'
import { HIDE_LAST_REFRESH } from 'uiSrc/constants'
import {
  deleteSelectedKeyAction,
  editKey,
  editKeyTTL,
  initialKeyInfo,
  keysSelector,
  refreshKey,
  selectedKeyDataSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'

import { KeyDetailsHeaderName } from './components/key-details-header-name'
import { KeyDetailsHeaderTTL } from './components/key-details-header-ttl'
import { KeyDetailsHeaderDelete } from './components/key-details-header-delete'
import { KeyDetailsHeaderSizeLength } from './components/key-details-header-size-length'

import styles from './styles.module.scss'

export interface KeyDetailsHeaderProps {
  onCloseKey: () => void
  onRemoveKey: () => void
  onEditKey: (
    key: RedisResponseBuffer,
    newKey: RedisResponseBuffer,
    onFailure?: () => void,
  ) => void
  isFullScreen: boolean
  arePanelsCollapsed: boolean
  onToggleFullScreen: () => void
  Actions?: (props: { width: number }) => ReactElement
}

const KeyDetailsHeader = ({
  isFullScreen,
  arePanelsCollapsed,
  onToggleFullScreen = () => {},
  onCloseKey,
  onRemoveKey,
  onEditKey,
  Actions,
}: KeyDetailsHeaderProps) => {
  const { refreshing, loading, lastRefreshTime, isRefreshDisabled } =
    useSelector(selectedKeySelector)
  const {
    type,
    length,
    name: keyBuffer,
  } = useSelector(selectedKeyDataSelector) ?? initialKeyInfo
  const { id: instanceId } = useSelector(connectedInstanceSelector)
  const { viewType } = useSelector(keysSelector)

  const dispatch = useDispatch()

  const handleRefreshKey = () => {
    dispatch(refreshKey(keyBuffer!, type, undefined, length))
  }

  const handleEditTTL = (key: RedisResponseBuffer, ttl: number) => {
    dispatch(editKeyTTL(key, ttl))
  }
  const handleEditKey = (
    oldKey: RedisResponseBuffer,
    newKey: RedisResponseBuffer,
    onFailure?: () => void,
  ) => {
    dispatch(
      editKey(oldKey, newKey, () => onEditKey(oldKey, newKey), onFailure),
    )
  }

  const handleDeleteKey = (key: RedisResponseBuffer) => {
    dispatch(deleteSelectedKeyAction(key, onRemoveKey))
  }

  const handleEnableAutoRefresh = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    const browserViewEvent = enableAutoRefresh
      ? TelemetryEvent.BROWSER_KEY_DETAILS_AUTO_REFRESH_ENABLED
      : TelemetryEvent.BROWSER_KEY_DETAILS_AUTO_REFRESH_DISABLED
    const treeViewEvent = enableAutoRefresh
      ? TelemetryEvent.TREE_VIEW_KEY_DETAILS_AUTO_REFRESH_ENABLED
      : TelemetryEvent.TREE_VIEW_KEY_DETAILS_AUTO_REFRESH_DISABLED
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(viewType, browserViewEvent, treeViewEvent),
      eventData: {
        length,
        databaseId: instanceId,
        keyType: type,
        refreshRate: +refreshRate,
      },
    })
  }

  const handleChangeAutoRefreshRate = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    if (enableAutoRefresh) {
      handleEnableAutoRefresh(enableAutoRefresh, refreshRate)
    }
  }

  return (
    <RiFlexItem
      className={`key-details-header ${styles.container}`}
      data-testid="key-details-header"
    >
      {loading ? (
        <div>
          <RiLoadingContent lines={2} />
        </div>
      ) : (
        <AutoSizer disableHeight>
          {({ width = 0 }) => (
            <div style={{ width }}>
              <RiRow gap="s" align="center" className={styles.keyFlexGroup}>
                <RiFlexItem>
                  <GroupBadge type={type} />
                </RiFlexItem>
                <KeyDetailsHeaderName onEditKey={handleEditKey} />
                <RiFlexItem grow />
                {!arePanelsCollapsed && (
                  <RiFlexItem style={{ marginRight: '8px' }}>
                    <FullScreen
                      isFullScreen={isFullScreen}
                      onToggleFullScreen={onToggleFullScreen}
                    />
                  </RiFlexItem>
                )}
                <RiFlexItem>
                  {(!arePanelsCollapsed || isFullScreen) && (
                    <RiTooltip content="Close" position="left">
                      <RiIconButton
                        icon={CancelSlimIcon}
                        aria-label="Close key"
                        className={styles.closeBtn}
                        onClick={() => onCloseKey()}
                        data-testid="close-key-btn"
                      />
                    </RiTooltip>
                  )}
                </RiFlexItem>
              </RiRow>
              <RiRow centered className={styles.groupSecondLine} gap="m">
                <KeyDetailsHeaderSizeLength width={width} />
                <KeyDetailsHeaderTTL onEditTTL={handleEditTTL} />
                <RiFlexItem grow>
                  <div className={styles.subtitleActionBtns}>
                    <AutoRefresh
                      postfix={type}
                      disabled={isRefreshDisabled}
                      loading={loading || refreshing}
                      lastRefreshTime={lastRefreshTime}
                      displayText={width > HIDE_LAST_REFRESH}
                      containerClassName={styles.actionBtn}
                      onRefresh={handleRefreshKey}
                      onEnableAutoRefresh={handleEnableAutoRefresh}
                      onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
                      testid="key"
                    />
                    {!isUndefined(Actions) && <Actions width={width} />}
                    <KeyDetailsHeaderDelete onDelete={handleDeleteKey} />
                  </div>
                </RiFlexItem>
              </RiRow>
            </div>
          )}
        </AutoSizer>
      )}
    </RiFlexItem>
  )
}

export { KeyDetailsHeader }
