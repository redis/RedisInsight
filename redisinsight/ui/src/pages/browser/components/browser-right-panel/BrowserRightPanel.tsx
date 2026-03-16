import { every } from 'lodash'
import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import AddKey from 'uiSrc/pages/browser/components/add-key/AddKey'
import BulkActions from 'uiSrc/pages/browser/components/bulk-actions'
import { KeyDetails } from 'uiSrc/pages/browser/modules'

import {
  keysDataSelector,
  keysSelector,
  selectedKeyDataSelector,
  toggleBrowserFullScreen,
} from 'uiSrc/slices/browser/keys'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { Nullable } from 'uiSrc/utils'
import { FeatureFlagComponent } from 'uiSrc/components'
import { FeatureFlags } from 'uiSrc/constants'

export interface Props {
  selectedKey: Nullable<RedisResponseBuffer>
  setSelectedKey: (keyName: Nullable<RedisResponseBuffer>) => void
  arePanelsCollapsed: boolean
  isAddKeyPanelOpen: boolean
  handleAddKeyPanel: (value: boolean) => void
  isBulkActionsPanelOpen: boolean
  handleBulkActionsPanel: (value: boolean) => void
  closeRightPanels: () => void
}

const BrowserRightPanel = (props: Props) => {
  const {
    selectedKey,
    arePanelsCollapsed,
    setSelectedKey,
    isAddKeyPanelOpen,
    handleAddKeyPanel,
    isBulkActionsPanelOpen,
    handleBulkActionsPanel,
    closeRightPanels,
  } = props

  const { isBrowserFullScreen, viewType } = useSelector(keysSelector)
  const { total, lastRefreshTime: keysLastRefreshTime } =
    useSelector(keysDataSelector)
  const { type, length } = useSelector(selectedKeyDataSelector) ?? {
    type: '',
    length: 0,
  }

  const { instanceId } = useParams<{ instanceId: string }>()
  const dispatch = useDispatch()

  const closePanel = () => {
    dispatch(toggleBrowserFullScreen(true))

    setSelectedKey(null)
    closeRightPanels()
  }

  const handleToggleFullScreen = () => {
    dispatch(toggleBrowserFullScreen())

    const browserViewEvent = !isBrowserFullScreen
      ? TelemetryEvent.BROWSER_KEY_DETAILS_FULL_SCREEN_ENABLED
      : TelemetryEvent.BROWSER_KEY_DETAILS_FULL_SCREEN_DISABLED
    const treeViewEvent = !isBrowserFullScreen
      ? TelemetryEvent.TREE_VIEW_KEY_DETAILS_FULL_SCREEN_ENABLED
      : TelemetryEvent.TREE_VIEW_KEY_DETAILS_FULL_SCREEN_DISABLED
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(viewType, browserViewEvent, treeViewEvent),
      eventData: {
        databaseId: instanceId,
        keyType: type,
        length,
      },
    })
  }

  const handleEditKey = (
    _key: RedisResponseBuffer,
    newKey: RedisResponseBuffer,
  ) => {
    setSelectedKey(newKey)
  }

  const onEditKey = useCallback(
    (key: RedisResponseBuffer, newKey: RedisResponseBuffer) =>
      handleEditKey(key, newKey),
    [],
  )

  const onSelectKey = useCallback(() => setSelectedKey(null), [])

  return (
    <>
      {every([!isAddKeyPanelOpen, !isBulkActionsPanelOpen], Boolean) && (
        <KeyDetails
          isFullScreen={isBrowserFullScreen}
          arePanelsCollapsed={arePanelsCollapsed}
          onToggleFullScreen={handleToggleFullScreen}
          keyProp={selectedKey}
          onCloseKey={closePanel}
          onEditKey={onEditKey}
          onRemoveKey={onSelectKey}
          totalKeys={total}
          keysLastRefreshTime={keysLastRefreshTime}
        />
      )}
      {isAddKeyPanelOpen && !isBulkActionsPanelOpen && (
        <AddKey
          onAddKeyPanel={handleAddKeyPanel}
          onClosePanel={closePanel}
          arePanelsCollapsed={arePanelsCollapsed}
        />
      )}
      {isBulkActionsPanelOpen && !isAddKeyPanelOpen && (
        <FeatureFlagComponent name={FeatureFlags.envDependent}>
          <BulkActions
            isFullScreen={isBrowserFullScreen}
            arePanelsCollapsed={arePanelsCollapsed}
            onClosePanel={closePanel}
            onBulkActionsPanel={handleBulkActionsPanel}
            onToggleFullScreen={handleToggleFullScreen}
          />
        </FeatureFlagComponent>
      )}
    </>
  )
}

export default React.memo(BrowserRightPanel)
