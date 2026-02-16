import React, { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  appContextBrowser,
  appContextSelector,
  setBrowserKeyListDataLoaded,
} from 'uiSrc/slices/app/context'
import {
  fetchKeys,
  fetchMoreKeys,
  keysDataSelector,
  keysSelector,
} from 'uiSrc/slices/browser/keys'
import { KeyViewType, SearchMode } from 'uiSrc/slices/interfaces/keys'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { setConnectedInstanceId } from 'uiSrc/slices/instances/instances'
import {
  SCAN_COUNT_DEFAULT,
  SCAN_TREE_COUNT_DEFAULT,
} from 'uiSrc/constants/api'
import {
  redisearchDataSelector,
  redisearchListSelector,
  redisearchSelector,
} from 'uiSrc/slices/browser/redisearch'
import { isEqualBuffers, Nullable } from 'uiSrc/utils'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import { KeyTypes } from 'uiSrc/constants'

import KeyList from '../key-list'
import KeyTree from '../key-tree'
import KeysHeader from '../keys-header'

import styles from './styles.module.scss'

export interface Props {
  selectedKey: Nullable<RedisResponseBuffer>
  selectKey: ({ rowData }: { rowData: any }) => void
  removeSelectedKey: () => void
  handleAddKeyPanel: (value: boolean) => void
  handleBulkActionsPanel: (value: boolean) => void
}

const BrowserLeftPanelLegacy = (props: Props) => {
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
    filter,
    deleting,
    error: keysError,
  } = useSelector(keysSelector)
  const { contextInstanceId } = useSelector(appContextSelector)
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
  return (
    <div className={styles.container}>
      <KeysHeader
        keysState={keysState}
        loading={headerLoading}
        isSearched={isSearched}
        loadKeys={loadKeys}
        handleScanMoreClick={handleScanMoreClick}
        nextCursor={keysState.nextCursor}
      />
      {keysError && (
        <div className={styles.error}>
          <div>{keysError}</div>
        </div>
      )}
      {viewType === KeyViewType.Browser && !keysError && (
        <KeyList
          hideFooter
          ref={keyListRef}
          keysState={keysState}
          loading={loading}
          scrollTopPosition={scrollTopPosition}
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
        />
      )}
    </div>
  )
}

export default React.memo(BrowserLeftPanelLegacy)
