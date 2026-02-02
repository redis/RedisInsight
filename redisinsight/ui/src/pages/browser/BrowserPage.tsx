import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { isNumber } from 'lodash'
import styled from 'styled-components'

import {
  formatLongName,
  getDbIndex,
  isEqualBuffers,
  Nullable,
  setTitle,
} from 'uiSrc/utils'
import { sendPageViewTelemetry, TelemetryPageView } from 'uiSrc/telemetry'
import {
  fetchKeys,
  keysSelector,
  resetKeyInfo,
  selectedKeyDataSelector,
  setInitialStateByType,
  toggleBrowserFullScreen,
} from 'uiSrc/slices/browser/keys'
import {
  setBrowserSelectedKey,
  appContextBrowser,
  setBrowserPanelSizes,
  setBrowserBulkActionOpen,
  appContextSelector,
} from 'uiSrc/slices/app/context'
import { resetErrors } from 'uiSrc/slices/app/notifications'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import {
  connectedInstanceOverviewSelector,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'

import { KeyViewType } from 'uiSrc/slices/interfaces/keys'
import {
  SCAN_COUNT_DEFAULT,
  SCAN_TREE_COUNT_DEFAULT,
} from 'uiSrc/constants/api'
import OnboardingStartPopover from 'uiSrc/pages/browser/components/onboarding-start-popover'
import { sidePanelsSelector } from 'uiSrc/slices/panels/sidePanels'
import { useStateWithContext } from 'uiSrc/services/hooks'

import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { ArrowLeftIcon } from 'uiSrc/components/base/icons'
import {
  ResizableContainer,
  ResizablePanel,
  ResizablePanelHandle,
} from 'uiSrc/components/base/layout'

import { useAppNavigationActions } from 'uiSrc/contexts/AppNavigationActionsProvider'
import Actions from 'uiSrc/pages/browser/components/actions/Actions'
import BrowserSearchPanel from './components/browser-search-panel'
import BrowserLeftPanel from './components/browser-left-panel'
import BrowserRightPanel from './components/browser-right-panel'

import styles from './styles.module.scss'

const widthResponsiveSize = 1280
const widthExplorePanel = 460

export const firstPanelId = 'keys'
export const secondPanelId = 'keyDetails'

const BorderedResizablePanel = styled(ResizablePanel)`
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
`

const isOneSideMode = (isInsightsOpen: boolean) =>
  globalThis.innerWidth <
  widthResponsiveSize + (isInsightsOpen ? widthExplorePanel : 0)

const BrowserPage = () => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const {
    name: connectedInstanceName,
    db = 0,
    isFreeDb,
  } = useSelector(connectedInstanceSelector)
  const {
    panelSizes,
    keyList: { selectedKey: selectedKeyContext },
    bulkActions: { opened: bulkActionOpenContext },
  } = useSelector(appContextBrowser)
  const { contextInstanceId } = useSelector(appContextSelector)

  const { isBrowserFullScreen } = useSelector(keysSelector)
  const { type } = useSelector(selectedKeyDataSelector) ?? {
    type: '',
    length: 0,
  }
  const { viewType, searchMode } = useSelector(keysSelector)
  const { openedPanel: openedSidePanel } = useSelector(sidePanelsSelector)
  const overview = useSelector(connectedInstanceOverviewSelector)

  const [isPageViewSent, setIsPageViewSent] = useState(false)
  const [arePanelsCollapsed, setArePanelsCollapsed] = useState(
    isOneSideMode(!!openedSidePanel),
  )
  const [isAddKeyPanelOpen, setIsAddKeyPanelOpen] = useState(false)
  const [isCreateIndexPanelOpen, setIsCreateIndexPanelOpen] = useState(false)
  const [isBulkActionsPanelOpen, setIsBulkActionsPanelOpen] = useState(
    bulkActionOpenContext,
  )

  const [selectedKey, setSelectedKey] = useStateWithContext<
    Nullable<RedisResponseBuffer>
  >(selectedKeyContext, null)

  const [sizes, setSizes] = useState(panelSizes)

  const prevSelectedType = useRef<string>(type)
  const prevDbIndex = useRef(db)
  const selectedKeyRef = useRef<Nullable<RedisResponseBuffer>>(selectedKey)
  const isBulkActionsPanelOpenRef = useRef<boolean>(isBulkActionsPanelOpen)
  const isSidePanelOpenRef = useRef<boolean>(!!openedSidePanel)

  const dispatch = useDispatch()

  const dbName = `${formatLongName(connectedInstanceName, 33, 0, '...')} ${getDbIndex(db)}`
  setTitle(`${dbName} - Browser`)
  const { setActions } = useAppNavigationActions()
  useEffect(() => {
    dispatch(resetErrors())
    updateWindowDimensions()
    globalThis.addEventListener('resize', updateWindowDimensions)
    setActions(
      <Actions
        handleAddKeyPanel={handleAddKeyPanel}
        handleBulkActionsPanel={handleBulkActionsPanel}
      />,
    )
    // componentWillUnmount
    return () => {
      globalThis.removeEventListener('resize', updateWindowDimensions)
      setSizes((prevSizes: number[]) => {
        dispatch(setBrowserPanelSizes(prevSizes))
        return []
      })
      dispatch(setBrowserBulkActionOpen(isBulkActionsPanelOpenRef.current))
      dispatch(setBrowserSelectedKey(selectedKeyRef.current))

      if (!selectedKeyRef.current) {
        dispatch(toggleBrowserFullScreen(false))
      }
    }
  }, [])

  useEffect(() => {
    isBulkActionsPanelOpenRef.current = isBulkActionsPanelOpen
  }, [isBulkActionsPanelOpen])

  useEffect(() => {
    if (contextInstanceId === instanceId) setSelectedKey(selectedKeyContext)
  }, [selectedKeyContext, contextInstanceId])

  useEffect(() => {
    selectedKeyRef.current = selectedKey
  }, [selectedKey])

  useEffect(() => {
    setArePanelsCollapsed(() => isOneSideMode(!!openedSidePanel))
    isSidePanelOpenRef.current = !!openedSidePanel
  }, [openedSidePanel])

  useEffect(() => {
    if (
      connectedInstanceName &&
      overview?.totalKeys !== undefined &&
      !isPageViewSent
    ) {
      sendPageView(instanceId, overview?.totalKeys)
    }
  }, [connectedInstanceName, overview, isPageViewSent])

  const updateWindowDimensions = () => {
    setArePanelsCollapsed(isOneSideMode(isSidePanelOpenRef.current))
  }

  const onPanelWidthChange = useCallback((newSizes: any) => {
    setSizes((prevSizes: any) => ({
      ...prevSizes,
      ...newSizes,
    }))
  }, [])

  const sendPageView = (instanceId: string, totalKeys: number | null) => {
    sendPageViewTelemetry({
      name: TelemetryPageView.BROWSER_PAGE,
      eventData: {
        databaseId: instanceId,
        isFree: isFreeDb,
        totalKeys,
      },
    })
    setIsPageViewSent(true)
  }

  const handlePanel = (value: boolean, keyName?: RedisResponseBuffer) => {
    if (
      value &&
      !isAddKeyPanelOpen &&
      !isBulkActionsPanelOpen &&
      !isCreateIndexPanelOpen
    ) {
      dispatch(resetKeyInfo())
    }

    dispatch(toggleBrowserFullScreen(false))
    setSelectedKey(keyName ?? null)
    closeRightPanels()
  }

  const handleAddKeyPanel = useCallback(
    (value: boolean, keyName?: RedisResponseBuffer) => {
      handlePanel(value, keyName)
      setIsAddKeyPanelOpen(value)
      dispatch(setBrowserSelectedKey(keyName || null))
    },
    [],
  )

  const handleBulkActionsPanel = useCallback((value: boolean) => {
    handlePanel(value)
    setIsBulkActionsPanelOpen(value)
  }, [])

  const handleRemoveSelectedKey = useCallback(() => {
    setBrowserSelectedKey(null)
    handlePanel(true)
  }, [])

  const handleCreateIndexPanel = useCallback((value: boolean) => {
    handlePanel(value)
    setIsCreateIndexPanelOpen(value)
  }, [])

  const closeRightPanels = useCallback(() => {
    setIsAddKeyPanelOpen(false)
    setIsBulkActionsPanelOpen(false)
    setIsCreateIndexPanelOpen(false)
  }, [])

  useEffect(() => {
    if (isNumber(db) && db !== prevDbIndex.current) {
      onChangeDbIndex()
    }
    prevDbIndex.current = db
  }, [db])

  const onChangeDbIndex = () => {
    if (selectedKey) {
      dispatch(toggleBrowserFullScreen(true))
      setSelectedKey(null)
    }

    dispatch(
      fetchKeys({
        searchMode,
        cursor: '0',
        count:
          viewType === KeyViewType.Browser
            ? SCAN_COUNT_DEFAULT
            : SCAN_TREE_COUNT_DEFAULT,
      }),
    )
  }

  const selectKey = useCallback(({ rowData }: { rowData: any }) => {
    if (!isEqualBuffers(rowData.name, selectedKeyRef.current)) {
      dispatch(toggleBrowserFullScreen(false))

      dispatch(setInitialStateByType(prevSelectedType.current))
      setSelectedKey(rowData.name)
      dispatch(setBrowserSelectedKey(rowData.name))
      closeRightPanels()
      prevSelectedType.current = rowData.type
    }
  }, [])

  const closePanel = () => {
    dispatch(toggleBrowserFullScreen(true))

    setSelectedKey(null)
    closeRightPanels()
  }

  const isRightPanelOpen =
    selectedKey !== null ||
    isAddKeyPanelOpen ||
    isBulkActionsPanelOpen ||
    isCreateIndexPanelOpen
  const isRightPanelFullScreen =
    (isBrowserFullScreen && isRightPanelOpen) ||
    (arePanelsCollapsed && isRightPanelOpen)

  return (
    <div
      className={`browserPage ${styles.container}`}
      data-testid="browser-page"
    >
      {arePanelsCollapsed && isRightPanelOpen && !isBrowserFullScreen && (
        <EmptyButton
          icon={ArrowLeftIcon}
          size="small"
          onClick={closePanel}
          className={styles.backBtn}
          data-testid="back-right-panel-btn"
        >
          Back
        </EmptyButton>
      )}
      <div
        className={cx({
          [styles.hidden]: isRightPanelFullScreen,
        })}
      >
        <BrowserSearchPanel handleCreateIndexPanel={handleCreateIndexPanel} />
      </div>
      <div className={cx(styles.main)}>
        <ResizableContainer
          className={styles.resizableContainer}
          direction="horizontal"
          onLayout={onPanelWidthChange}
        >
          <BorderedResizablePanel
            defaultSize={sizes && sizes[0] ? sizes[0] : 50}
            minSize={45}
            id={firstPanelId}
            className={cx({
              [styles.fullWidth]:
                arePanelsCollapsed ||
                (isBrowserFullScreen && !isRightPanelOpen),
            })}
          >
            <BrowserLeftPanel
              selectedKey={selectedKey}
              selectKey={selectKey}
              removeSelectedKey={handleRemoveSelectedKey}
              handleAddKeyPanel={handleAddKeyPanel}
              handleBulkActionsPanel={handleBulkActionsPanel}
            />
          </BorderedResizablePanel>
          {!arePanelsCollapsed && !isBrowserFullScreen && (
            <ResizablePanelHandle />
          )}
          <BorderedResizablePanel
            defaultSize={sizes && sizes[1] ? sizes[1] : 50}
            minSize={45}
            id={secondPanelId}
            className={cx({
              [styles.keyDetailsOpen]: isRightPanelOpen,
              [styles.fullWidth]:
                arePanelsCollapsed || (isRightPanelOpen && isBrowserFullScreen),
              [styles.keyDetails]:
                arePanelsCollapsed || (isRightPanelOpen && isBrowserFullScreen),
            })}
          >
            <BrowserRightPanel
              arePanelsCollapsed={arePanelsCollapsed}
              setSelectedKey={setSelectedKey}
              selectedKey={selectedKey}
              isAddKeyPanelOpen={isAddKeyPanelOpen}
              isCreateIndexPanelOpen={isCreateIndexPanelOpen}
              isBulkActionsPanelOpen={isBulkActionsPanelOpen}
              handleAddKeyPanel={handleAddKeyPanel}
              handleBulkActionsPanel={handleBulkActionsPanel}
              closeRightPanels={closeRightPanels}
            />
          </BorderedResizablePanel>
        </ResizableContainer>
      </div>
      <OnboardingStartPopover />
    </div>
  )
}

export default BrowserPage
