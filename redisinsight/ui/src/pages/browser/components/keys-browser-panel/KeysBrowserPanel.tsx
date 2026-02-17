import React, { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import AutoSizer from 'react-virtualized-auto-sizer'

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
import { isNull } from 'lodash'
import { AutoRefresh } from 'uiSrc/components'
import ScanMore from 'uiSrc/components/scan-more'
import { numberWithSpaces, nullableNumberWithSpaces } from 'uiSrc/utils/numbers'
import { PlusIcon } from 'uiSrc/components/base/icons'
import { ActionIconButton } from 'uiSrc/components/base/forms/buttons'
import { Text, ColorText } from 'uiSrc/components/base/text'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'

import {
  KeysBrowser,
  ViewSwitch,
  ColumnsMenu,
  useResponsiveColumns,
} from 'uiSrc/components/browser'

import KeyList from '../key-list'
import KeyTree, { KeyTreeSettings } from '../key-tree'
import { Props } from '../browser-left-panel/BrowserLeftPanel'

import * as S from './KeysBrowserPanel.styles'

const HIDE_REFRESH_LABEL_WIDTH = 640

const KeysBrowserPanel = (props: Props) => {
  const {
    selectedKey,
    selectKey,
    removeSelectedKey,
    handleAddKeyPanel,
    handleBulkActionsPanel,
  } = props

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

  // TODO: Check if encoding can be reused from BE and FE
  const format = keyNameFormat as unknown as KeyValueFormat
  const isTreeViewDisabled =
    (format || KeyValueFormat.Unicode) === KeyValueFormat.HEX

  useEffect(() => {
    if (
      (!isDataLoaded || contextInstanceId !== instanceId) &&
      searchMode === SearchMode.Pattern
    ) {
      loadKeys(viewType)
    }
  }, [searchMode])

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

  const loadMoreItems = (
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
  }

  const handleScanMoreClick = (config: {
    startIndex: number
    stopIndex: number
  }) => {
    keyListRef.current?.handleLoadMoreItems?.(config)
  }

  const onDeleteKey = useCallback(
    (key: RedisResponseBuffer) => {
      if (isEqualBuffers(key, selectedKey)) {
        removeSelectedKey()
      }
    },
    [selectedKey],
  )

  const handleRefreshKeys = () => {
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
  }

  const handleEnableAutoRefresh = (
    enableAutoRefresh: boolean,
    refreshRate: string,
  ) => {
    const browserViewEvent = enableAutoRefresh
      ? TelemetryEvent.BROWSER_KEY_LIST_AUTO_REFRESH_ENABLED
      : TelemetryEvent.BROWSER_KEY_LIST_AUTO_REFRESH_DISABLED
    const treeViewEvent = enableAutoRefresh
      ? TelemetryEvent.TREE_VIEW_KEY_LIST_AUTO_REFRESH_ENABLED
      : TelemetryEvent.TREE_VIEW_KEY_LIST_AUTO_REFRESH_DISABLED
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(viewType, browserViewEvent, treeViewEvent),
      eventData: {
        databaseId: connectedInstanceId,
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

  const handleScanMore = (config: any) => {
    handleScanMoreClick?.({
      ...config,
      stopIndex:
        (viewType === KeyViewType.Browser
          ? SCAN_COUNT_DEFAULT
          : SCAN_TREE_COUNT_DEFAULT) - 1,
    })
  }

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

  const scanMoreStyle = {
    marginLeft: 10,
    height: '36px !important',
  }

  const footerScanned =
    isSearched ||
    (isFiltered && searchMode === SearchMode.Pattern) ||
    viewType === KeyViewType.Tree
      ? keysState.scanned
      : 0

  const footerScannedDisplay =
    keysState.keys.length > (footerScanned ?? 0)
      ? keysState.keys.length
      : (footerScanned ?? 0)

  const footerNotAccurateScanned =
    keysState.total &&
    (footerScanned ?? 0) >= keysState.total &&
    keysState.nextCursor &&
    keysState.nextCursor !== '0'
      ? '~'
      : ''

  const showScanMore = !(
    searchMode === SearchMode.Redisearch &&
    keysState.maxResults &&
    keysState.keys.length >= keysState.maxResults
  )

  return (
    <S.Container ref={containerRef}>
      <KeysBrowser.Compose data-testid="keys-browser-panel">
        <KeysBrowser.Header>
          <AutoSizer disableHeight>
            {({ width }) => (
              <Row align="center" justify="between" style={{ width }}>
                <Row gap="l" align="center" grow={false}>
                  <FlexItem>
                    <AutoRefresh
                      disabled={
                        searchMode === SearchMode.Redisearch && !selectedIndex
                      }
                      disabledRefreshButtonMessage="Select an index to refresh keys."
                      iconSize="S"
                      postfix="keys"
                      loading={loading}
                      lastRefreshTime={keysState.lastRefreshTime}
                      displayText={(width || 0) > HIDE_REFRESH_LABEL_WIDTH}
                      onRefresh={handleRefreshKeys}
                      onEnableAutoRefresh={handleEnableAutoRefresh}
                      onChangeAutoRefreshRate={handleChangeAutoRefreshRate}
                      testid="keys"
                    />
                  </FlexItem>
                  <FlexItem>
                    <ColumnsMenu
                      shownColumns={shownColumns}
                      onToggleColumn={handleToggleColumn}
                    />
                  </FlexItem>
                </Row>
                <Row gap="l" align="center" grow={false}>
                  <FlexItem>
                    <ActionIconButton
                      icon={PlusIcon}
                      variant="secondary"
                      aria-label="Add key"
                      onClick={openAddKeyPanel}
                      data-testid="btn-add-key"
                    />
                  </FlexItem>
                  <FlexItem>
                    <ViewSwitch
                      viewType={viewType}
                      isTreeViewDisabled={isTreeViewDisabled}
                      onChange={handleSwitchView}
                    />
                  </FlexItem>
                </Row>
              </Row>
            )}
          </AutoSizer>
        </KeysBrowser.Header>

        <KeysBrowser.Content>
          {keysError && (
            <S.ErrorContainer data-testid="keys-error">
              <div>{keysError}</div>
            </S.ErrorContainer>
          )}
          {viewType === KeyViewType.Browser && !keysError && (
            <KeyList
              hideFooter
              ref={keyListRef}
              keysState={keysState}
              loading={loading}
              scrollTopPosition={scrollTopPosition}
              visibleColumns={effectiveColumns}
              commonFilterType={commonFilterType as Nullable<KeyTypes>}
              loadMoreItems={loadMoreItems}
              selectKey={selectKey}
              onDelete={onDeleteKey}
              onAddKeyPanel={handleAddKeyPanel}
            />
          )}
          {viewType === KeyViewType.Tree && !keysError && (
            <KeyTree
              ref={keyListRef}
              keysState={keysState}
              loading={loading}
              commonFilterType={commonFilterType as Nullable<KeyTypes>}
              selectKey={selectKey}
              loadMoreItems={loadMoreItems}
              onDelete={onDeleteKey}
              deleting={deleting}
              onAddKeyPanel={handleAddKeyPanel}
              onBulkActionsPanel={handleBulkActionsPanel}
              visibleColumns={effectiveColumns}
            />
          )}
        </KeysBrowser.Content>

        <KeysBrowser.Footer>
          <Row align="center" justify="between" grow data-testid="keys-summary">
            <FlexItem>
              {headerLoading &&
                !keysState.total &&
                !isNull(keysState.total) && (
                  <Text size="s" data-testid="scanning-text">
                    Scanning...
                  </Text>
                )}
              {!!footerScanned && (
                <ColorText size="s" variant="semiBold" component="span">
                  {'Results: '}
                  <span data-testid="keys-number-of-results">
                    {numberWithSpaces(keysState.keys.length)}
                  </span>
                </ColorText>
              )}
              {!footerScanned &&
                (!!keysState.total || isNull(keysState.total)) && (
                  <Text size="s" variant="semiBold" component="span">
                    {'Total: '}
                    {nullableNumberWithSpaces(keysState.total)}
                  </Text>
                )}
            </FlexItem>
            <Row gap="l" align="center" grow={false}>
              {!!footerScanned && (
                <FlexItem>
                  <ColorText size="s" color="secondary" component="span">
                    {'Scanned '}
                    <span data-testid="keys-number-of-scanned">
                      {footerNotAccurateScanned}
                      {numberWithSpaces(footerScannedDisplay)}
                    </span>
                    {' / '}
                    <span data-testid="keys-total">
                      {nullableNumberWithSpaces(keysState.total)}
                    </span>
                  </ColorText>
                </FlexItem>
              )}
              {showScanMore && (
                <FlexItem>
                  <ScanMore
                    withAlert={false}
                    fill={false}
                    style={scanMoreStyle}
                    scanned={footerScanned}
                    totalItemsCount={keysState.total}
                    loading={headerLoading}
                    loadMoreItems={handleScanMore}
                    nextCursor={keysState.nextCursor}
                  />
                </FlexItem>
              )}
              {viewType === KeyViewType.Tree && (
                <FlexItem>
                  <KeyTreeSettings loading={headerLoading} />
                </FlexItem>
              )}
            </Row>
          </Row>
        </KeysBrowser.Footer>
      </KeysBrowser.Compose>
    </S.Container>
  )
}

export default React.memo(KeysBrowserPanel)
