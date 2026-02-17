import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  appContextBrowser,
  appContextDbConfig,
  appContextSelector,
  resetBrowserTree,
  setBrowserKeyListDataLoaded,
  setBrowserSelectedKey,
  setBrowserShownColumns,
} from 'uiSrc/slices/app/context'
import {
  changeKeyViewType,
  fetchKeys,
  fetchMoreKeys,
  keysDataSelector,
  keysSelector,
  resetKeyInfo,
  resetKeysData,
} from 'uiSrc/slices/browser/keys'
import {
  redisearchDataSelector,
  redisearchListSelector,
  redisearchSelector,
} from 'uiSrc/slices/browser/redisearch'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import {
  setConnectedInstanceId,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { setConnectivityError } from 'uiSrc/slices/app/connectivity'
import {
  SCAN_COUNT_DEFAULT,
  SCAN_TREE_COUNT_DEFAULT,
} from 'uiSrc/constants/api'
import { isEqualBuffers, Nullable } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { BrowserColumns, KeyTypes, KeyValueFormat } from 'uiSrc/constants'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { OnboardingStepName, OnboardingSteps } from 'uiSrc/constants/onboarding'
import { incrementOnboardStepAction } from 'uiSrc/slices/app/features'

import { useResponsiveColumns } from 'uiSrc/components/browser'

import { Props } from '../../browser-left-panel/BrowserLeftPanel'
import { KeysBrowserPanelContextValue } from '../KeysBrowserPanel.types'

const KeysBrowserPanelContext =
  createContext<KeysBrowserPanelContextValue | null>(null)

export const useKeysBrowserPanel = (): KeysBrowserPanelContextValue => {
  const ctx = useContext(KeysBrowserPanelContext)
  if (!ctx) {
    throw new Error('useKeysBrowserPanel must be used within Context provider')
  }
  return ctx
}

export const Context = ({
  selectedKey,
  selectKey,
  removeSelectedKey,
  handleAddKeyPanel,
  handleBulkActionsPanel,
  children,
}: Props & { children: React.ReactNode }) => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const patternKeysState = useSelector(keysDataSelector)
  const redisearchKeysState = useSelector(redisearchDataSelector)
  const { loading: redisearchLoading, isSearched: redisearchIsSearched } =
    useSelector(redisearchSelector)
  const { loading: redisearchListLoading } = useSelector(redisearchListSelector)
  const {
    loading: patternLoading,
    viewType,
    searchMode,
    isSearched: patternIsSearched,
    isFiltered,
    filter,
    deleting,
    error: keysError,
  } = useSelector(keysSelector)
  const { id: connectedInstanceId, keyNameFormat } = useSelector(
    connectedInstanceSelector,
  )
  const { contextInstanceId } = useSelector(appContextSelector)
  const { shownColumns } = useSelector(appContextDbConfig)
  const { selectedIndex } = useSelector(redisearchSelector)
  const {
    keyList: {
      isDataPatternLoaded,
      isDataRedisearchLoaded,
      scrollPatternTopPosition,
      scrollRedisearchTopPosition,
    },
  } = useSelector(appContextBrowser)

  const keyListRef = useRef<any>()
  const dispatch = useDispatch()

  const { effectiveColumns, containerRef } = useResponsiveColumns(shownColumns)

  const isDataLoaded =
    searchMode === SearchMode.Pattern
      ? isDataPatternLoaded
      : isDataRedisearchLoaded
  const keysState =
    searchMode === SearchMode.Pattern ? patternKeysState : redisearchKeysState
  const loading =
    searchMode === SearchMode.Pattern ? patternLoading : redisearchLoading
  const headerLoading =
    searchMode === SearchMode.Pattern ? patternLoading : redisearchListLoading
  const isSearched =
    searchMode === SearchMode.Pattern ? patternIsSearched : redisearchIsSearched
  const scrollTopPosition =
    searchMode === SearchMode.Pattern
      ? scrollPatternTopPosition
      : scrollRedisearchTopPosition
  const commonFilterType =
    searchMode === SearchMode.Pattern ? filter : keysState.keys?.[0]?.type

  const format = keyNameFormat as unknown as KeyValueFormat
  const isTreeViewDisabled =
    (format || KeyValueFormat.Unicode) === KeyValueFormat.HEX

  const loadKeys = useCallback(
    (keyViewType: KeyViewType = KeyViewType.Browser) => {
      dispatch(setConnectedInstanceId(instanceId))

      dispatch(
        fetchKeys(
          {
            searchMode,
            cursor: '0',
            count:
              keyViewType === KeyViewType.Browser
                ? SCAN_COUNT_DEFAULT
                : SCAN_TREE_COUNT_DEFAULT,
          },
          () => dispatch(setBrowserKeyListDataLoaded(searchMode, true)),
          () => dispatch(setBrowserKeyListDataLoaded(searchMode, false)),
        ),
      )
    },
    [searchMode],
  )

  useEffect(() => {
    if (
      (!isDataLoaded || contextInstanceId !== instanceId) &&
      searchMode === SearchMode.Pattern
    ) {
      loadKeys(viewType)
    }
  }, [searchMode])

  const loadMoreItems = useCallback(
    (
      oldKeys: IKeyPropTypes[],
      { startIndex, stopIndex }: { startIndex: number; stopIndex: number },
    ) => {
      if (keysState.nextCursor !== '0') {
        dispatch(
          fetchMoreKeys(
            searchMode,
            oldKeys,
            keysState.nextCursor,
            stopIndex - startIndex + 1,
          ),
        )
      }
    },
    [searchMode, keysState.nextCursor],
  )

  const onDeleteKey = useCallback(
    (key: RedisResponseBuffer) => {
      if (isEqualBuffers(key, selectedKey)) {
        removeSelectedKey()
      }
    },
    [selectedKey],
  )

  const handleRefreshKeys = useCallback(() => {
    dispatch(
      fetchKeys(
        {
          searchMode,
          cursor: '0',
          count:
            viewType === KeyViewType.Browser
              ? SCAN_COUNT_DEFAULT
              : SCAN_TREE_COUNT_DEFAULT,
        },
        (data) => {
          const keys = Array.isArray(data) ? data[0].keys : data.keys

          if (!keys.length) {
            dispatch(resetKeyInfo())
            dispatch(setBrowserSelectedKey(null))
          }

          dispatch(setBrowserKeyListDataLoaded(searchMode, true))
          dispatch(setConnectivityError(null))
        },
        () => dispatch(setBrowserKeyListDataLoaded(searchMode, false)),
      ),
    )
  }, [searchMode, viewType])

  const handleEnableAutoRefresh = useCallback(
    (enableAutoRefresh: boolean, refreshRate: string) => {
      const browserViewEvent = enableAutoRefresh
        ? TelemetryEvent.BROWSER_KEY_LIST_AUTO_REFRESH_ENABLED
        : TelemetryEvent.BROWSER_KEY_LIST_AUTO_REFRESH_DISABLED
      const treeViewEvent = enableAutoRefresh
        ? TelemetryEvent.TREE_VIEW_KEY_LIST_AUTO_REFRESH_ENABLED
        : TelemetryEvent.TREE_VIEW_KEY_LIST_AUTO_REFRESH_DISABLED
      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          viewType,
          browserViewEvent,
          treeViewEvent,
        ),
        eventData: {
          databaseId: connectedInstanceId,
          refreshRate: +refreshRate,
        },
      })
    },
    [viewType, connectedInstanceId],
  )

  const handleChangeAutoRefreshRate = useCallback(
    (enableAutoRefresh: boolean, refreshRate: string) => {
      if (enableAutoRefresh) {
        handleEnableAutoRefresh(enableAutoRefresh, refreshRate)
      }
    },
    [handleEnableAutoRefresh],
  )

  const openAddKeyPanel = useCallback(() => {
    handleAddKeyPanel(true)
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_ADD_BUTTON_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_ADD_BUTTON_CLICKED,
      ),
      eventData: {
        databaseId: connectedInstanceId,
      },
    })
  }, [viewType, connectedInstanceId, handleAddKeyPanel])

  const handleSwitchView = useCallback(
    (type: KeyViewType) => {
      sendEventTelemetry({
        event:
          type === KeyViewType.Tree
            ? TelemetryEvent.TREE_VIEW_OPENED
            : TelemetryEvent.LIST_VIEW_OPENED,
        eventData: {
          databaseId: connectedInstanceId,
        },
      })

      dispatch(resetBrowserTree())
      dispatch(resetKeysData(searchMode))

      if (!(searchMode === SearchMode.Redisearch && !selectedIndex)) {
        loadKeys(type)
      }

      setTimeout(() => {
        dispatch(changeKeyViewType(type))
      }, 0)

      if (type === KeyViewType.Tree) {
        dispatch(
          incrementOnboardStepAction(
            OnboardingSteps.BrowserTreeView,
            undefined,
            () =>
              sendEventTelemetry({
                event: TelemetryEvent.ONBOARDING_TOUR_ACTION_MADE,
                eventData: {
                  databaseId: connectedInstanceId,
                  step: OnboardingStepName.BrowserTreeView,
                },
              }),
          ),
        )
      }
    },
    [searchMode, connectedInstanceId, selectedIndex, loadKeys],
  )

  const handleToggleColumn = useCallback(
    (checked: boolean, columnType: BrowserColumns) => {
      const shown: BrowserColumns[] = []
      const hidden: BrowserColumns[] = []
      const newColumns = checked
        ? [...shownColumns, columnType]
        : shownColumns.filter((col) => col !== columnType)

      if (checked) {
        shown.push(columnType)
      } else {
        hidden.push(columnType)
      }

      dispatch(setBrowserShownColumns(newColumns))
      sendEventTelemetry({
        event: TelemetryEvent.SHOW_BROWSER_COLUMN_CLICKED,
        eventData: {
          databaseId: connectedInstanceId,
          shown,
          hidden,
        },
      })
    },
    [shownColumns, connectedInstanceId],
  )

  const handleScanMore = useCallback(
    (config: any) => {
      keyListRef.current?.handleLoadMoreItems?.({
        ...config,
        stopIndex:
          (viewType === KeyViewType.Browser
            ? SCAN_COUNT_DEFAULT
            : SCAN_TREE_COUNT_DEFAULT) - 1,
      })
    },
    [viewType],
  )

  const value: KeysBrowserPanelContextValue = {
    viewType,
    searchMode,
    isTreeViewDisabled,

    loading,
    headerLoading,

    keysState,
    keysError,
    commonFilterType: commonFilterType as Nullable<KeyTypes>,
    scrollTopPosition,

    isSearched,
    isFiltered,

    shownColumns,
    effectiveColumns,

    selectedIndex,
    connectedInstanceId,
    deleting,

    keyListRef,
    containerRef,

    selectKey,
    handleAddKeyPanel,
    handleBulkActionsPanel,

    handleRefreshKeys,
    handleEnableAutoRefresh,
    handleChangeAutoRefreshRate,
    handleToggleColumn,
    openAddKeyPanel,
    handleSwitchView,
    loadMoreItems,
    onDeleteKey,
    handleScanMore,
  }

  return (
    <KeysBrowserPanelContext.Provider value={value}>
      {children}
    </KeysBrowserPanelContext.Provider>
  )
}
