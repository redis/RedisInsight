import React, {
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  appContextBrowser,
  appContextSelector,
  resetBrowserTree,
  setBrowserKeyListDataLoaded,
  setBrowserSelectedKey,
} from 'uiSrc/slices/app/context'
import {
  fetchKeys,
  fetchMoreKeys,
  keysDataSelector,
  keysSelector,
  resetKeyInfo,
  resetKeysData,
  setFilter,
} from 'uiSrc/slices/browser/keys'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import {
  setConnectedInstanceId,
  connectedInstanceSelector,
} from 'uiSrc/slices/instances/instances'
import { setConnectivityError } from 'uiSrc/slices/app/connectivity'
import { SCAN_TREE_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { Nullable } from 'uiSrc/utils'
import { KeyTypes } from 'uiSrc/constants'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'

import { KeysBrowserContextValue, KeysBrowserProps } from '../KeysBrowser.types'

export const KeysBrowserContext = createContext<KeysBrowserContextValue | null>(
  null,
)

const SUPPORTED_TABS = [KeyTypes.Hash, KeyTypes.ReJSON] as const

export const Provider = ({
  onSelectKey,
  children,
}: KeysBrowserProps & { children: React.ReactNode }) => {
  const { instanceId } = useParams<{ instanceId: string }>()
  const keysState = useSelector(keysDataSelector)
  const {
    loading,
    isSearched,
    isFiltered,
    filter,
    error: keysError,
  } = useSelector(keysSelector)
  const { id: connectedInstanceId } = useSelector(connectedInstanceSelector)
  const { contextInstanceId } = useSelector(appContextSelector)
  const {
    keyList: { isDataPatternLoaded, scrollPatternTopPosition },
  } = useSelector(appContextBrowser)
  const dispatch = useDispatch()

  const [activeTab, setActiveTab] = useState<KeyTypes>(SUPPORTED_TABS[0])

  const keyListRef = useRef<any>()

  const loadKeys = useCallback(() => {
    dispatch(
      fetchKeys(
        {
          searchMode: SearchMode.Pattern,
          cursor: '0',
          count: SCAN_TREE_COUNT_DEFAULT,
        },
        () => dispatch(setBrowserKeyListDataLoaded(SearchMode.Pattern, true)),
        () => dispatch(setBrowserKeyListDataLoaded(SearchMode.Pattern, false)),
      ),
    )
  }, [instanceId])

  useEffect(() => {
    if (connectedInstanceId !== instanceId) {
      dispatch(setConnectedInstanceId(instanceId))
    }

    dispatch(setFilter(activeTab))
    if (!isDataPatternLoaded || contextInstanceId !== instanceId) {
      loadKeys()
    }
  }, [])

  const loadMoreItems = useCallback(
    (
      oldKeys: IKeyPropTypes[],
      { startIndex, stopIndex }: { startIndex: number; stopIndex: number },
    ) => {
      if (keysState.nextCursor !== '0') {
        dispatch(
          fetchMoreKeys(
            SearchMode.Pattern,
            oldKeys,
            keysState.nextCursor,
            stopIndex - startIndex + 1,
          ),
        )
      }
    },
    [keysState.nextCursor],
  )

  const handleRefreshKeys = useCallback(() => {
    dispatch(
      fetchKeys(
        {
          searchMode: SearchMode.Pattern,
          cursor: '0',
          count: SCAN_TREE_COUNT_DEFAULT,
        },
        (data) => {
          const keys = Array.isArray(data) ? data[0].keys : data.keys

          if (!keys.length) {
            dispatch(resetKeyInfo())
            dispatch(setBrowserSelectedKey(null))
          }

          dispatch(setBrowserKeyListDataLoaded(SearchMode.Pattern, true))
          dispatch(setConnectivityError(null))
        },
        () => dispatch(setBrowserKeyListDataLoaded(SearchMode.Pattern, false)),
      ),
    )
  }, [])

  const handleEnableAutoRefresh = useCallback(
    (enableAutoRefresh: boolean, refreshRate: string) => {
      sendEventTelemetry({
        event: enableAutoRefresh
          ? TelemetryEvent.TREE_VIEW_KEY_LIST_AUTO_REFRESH_ENABLED
          : TelemetryEvent.TREE_VIEW_KEY_LIST_AUTO_REFRESH_DISABLED,
        eventData: {
          databaseId: instanceId,
          refreshRate: +refreshRate,
        },
      })
    },
    [instanceId],
  )

  const handleChangeAutoRefreshRate = useCallback(
    (enableAutoRefresh: boolean, refreshRate: string) => {
      if (enableAutoRefresh) {
        handleEnableAutoRefresh(enableAutoRefresh, refreshRate)
      }
    },
    [handleEnableAutoRefresh],
  )

  const handleTabChange = useCallback(
    (tab: KeyTypes) => {
      setActiveTab(tab)
      dispatch(resetBrowserTree())
      dispatch(resetKeysData(SearchMode.Pattern))
      dispatch(setFilter(tab))
      loadKeys()
    },
    [loadKeys],
  )

  const selectKey = useCallback(
    ({ rowData }: { rowData: any }) => {
      onSelectKey(rowData.name)
    },
    [onSelectKey],
  )

  const handleScanMore = useCallback((config: any) => {
    keyListRef.current?.handleLoadMoreItems?.({
      ...config,
      stopIndex: SCAN_TREE_COUNT_DEFAULT - 1,
    })
  }, [])

  const value: KeysBrowserContextValue = {
    loading,
    headerLoading: loading,

    keysState,
    keysError,
    commonFilterType: filter as Nullable<KeyTypes>,
    scrollTopPosition: scrollPatternTopPosition,

    activeTab,

    isSearched,
    isFiltered,

    keyListRef,

    selectKey,

    handleRefreshKeys,
    handleEnableAutoRefresh,
    handleChangeAutoRefreshRate,
    handleTabChange,
    loadMoreItems,
    handleScanMore,
  }

  return (
    <KeysBrowserContext.Provider value={value}>
      {children}
    </KeysBrowserContext.Provider>
  )
}
