import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { debounce, findIndex, isUndefined, reject } from 'lodash'

import { CellMeasurerCache } from 'react-virtualized'
import {
  bufferToString,
  bufferFormatRangeItems,
  Nullable,
  Maybe,
} from 'uiSrc/utils'
import {
  deleteKeyAction,
  fetchKeysMetadata,
  keysDataSelector,
  keysSelector,
  selectedKeySelector,
  sourceKeysFetch,
} from 'uiSrc/slices/browser/keys'
import {
  appContextBrowser,
  setBrowserPatternScrollPosition,
  setBrowserIsNotRendered,
  setBrowserRedisearchScrollPosition,
  appContextDbConfig,
} from 'uiSrc/slices/app/context'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { SearchMode } from 'uiSrc/slices/interfaces/keys'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { ITableColumn } from 'uiSrc/components/virtual-table/interfaces'
import {
  BrowserColumns,
  KeyTypes,
  ModulesKeyTypes,
  TableCellAlignment,
  TableCellTextAlignment,
} from 'uiSrc/constants'
import { IKeyPropTypes } from 'uiSrc/constants/prop-types/keys'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RedisResponseBuffer } from 'uiSrc/slices/interfaces'
import KeyRowTTL from 'uiSrc/pages/browser/components/key-row-ttl'
import KeyRowSize from 'uiSrc/pages/browser/components/key-row-size'
import KeyRowName from 'uiSrc/pages/browser/components/key-row-name'
import KeyRowType from 'uiSrc/pages/browser/components/key-row-type'

import { GetKeyInfoResponse } from 'apiSrc/modules/browser/keys/dto'

import * as S from './KeyList.styles'
import { Props } from './KeyList.types'
import NoKeysMessage from '../no-keys-message'
import { DeleteKeyPopover } from '../delete-key-popover/DeleteKeyPopover'
import { useKeyFormat } from '../use-key-format'

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: 43,
})

const KeyList = forwardRef((props: Props, ref) => {
  let wheelTimer = 0
  const {
    selectKey,
    loadMoreItems,
    loading,
    keysState,
    scrollTopPosition,
    hideFooter,
    visibleColumns: visibleColumnsProp,
    onDelete,
    commonFilterType,
    onAddKeyPanel,
  } = props

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { handler: keyFormatConvertor } = useKeyFormat()

  const selectedKey = useSelector(selectedKeySelector)
  const { nextCursor, previousResultCount } = useSelector(keysDataSelector)
  const { isSearched, isFiltered, searchMode } = useSelector(keysSelector)
  const { shownColumns } = useSelector(appContextDbConfig)
  const visibleColumns = visibleColumnsProp ?? shownColumns
  const {
    keyList: { isNotRendered: isNotRenderedContext },
  } = useSelector(appContextBrowser)

  const [, rerender] = useState({})
  const [firstDataLoaded, setFirstDataLoaded] = useState<boolean>(
    !!keysState.keys.length || !isNotRenderedContext,
  )
  const [deletePopoverIndex, setDeletePopoverIndex] =
    useState<Maybe<number>>(undefined)

  const controller = useRef<Nullable<AbortController>>(null)
  const itemsRef = useRef(keysState.keys)
  const renderedRowsIndexesRef = useRef({ startIndex: 0, lastIndex: 0 })

  const dispatch = useDispatch()

  const prevIncludeSize = useRef(shownColumns?.includes(BrowserColumns.Size))
  const prevIncludeTTL = useRef(shownColumns?.includes(BrowserColumns.TTL))

  useImperativeHandle(ref, () => ({
    handleLoadMoreItems(config: { startIndex: number; stopIndex: number }) {
      onLoadMoreItems(config)
    },
  }))

  useEffect(() => {
    cancelAllMetadataRequests()
  }, [searchMode])

  useEffect(() => {
    itemsRef.current = [...keysState.keys]

    if (
      (!firstDataLoaded && keysState.lastRefreshTime) ||
      (searchMode === SearchMode.Redisearch && itemsRef.current.length === 0)
    ) {
      setFirstDataLoaded(true)
      dispatch(setBrowserIsNotRendered(false))
    }

    if (itemsRef.current.length === 0) {
      cancelAllMetadataRequests()
      rerender({})
      return
    }

    cancelAllMetadataRequests()
    controller.current = new AbortController()

    const { startIndex, lastIndex } = renderedRowsIndexesRef.current
    onRowsRendered(startIndex, lastIndex)
    rerender({})
  }, [keysState.keys])

  useEffect(() => {
    const isSizeReenabled =
      !prevIncludeSize.current && shownColumns.includes(BrowserColumns.Size)
    const isTtlReenabled =
      !prevIncludeTTL.current && shownColumns.includes(BrowserColumns.TTL)

    if (
      (isSizeReenabled || isTtlReenabled) &&
      firstDataLoaded &&
      itemsRef.current.length > 0
    ) {
      cancelAllMetadataRequests()
      controller.current = new AbortController()

      const { startIndex, lastIndex } = renderedRowsIndexesRef.current
      const visibleItems = bufferFormatRangeItems(
        itemsRef.current,
        startIndex,
        lastIndex,
        formatItem,
      )

      getMetadata(startIndex, visibleItems, true)
    }

    prevIncludeSize.current = shownColumns.includes(BrowserColumns.Size)
    prevIncludeTTL.current = shownColumns.includes(BrowserColumns.TTL)
  }, [shownColumns])

  const cancelAllMetadataRequests = () => {
    controller.current?.abort()
  }

  const NoItemsMessage = () => (
    <NoKeysMessage
      isLoading={loading || !firstDataLoaded}
      total={keysState.total}
      scanned={keysState.scanned}
      onAddKeyPanel={onAddKeyPanel}
    />
  )

  const onLoadMoreItems = (props: {
    startIndex: number
    stopIndex: number
  }) => {
    if (
      searchMode === SearchMode.Redisearch &&
      keysState.maxResults &&
      keysState.keys.length >= keysState.maxResults
    ) {
      return
    }
    loadMoreItems?.(itemsRef.current as IKeyPropTypes[], props)
  }

  const onWheelSearched = (event: React.WheelEvent) => {
    setDeletePopoverIndex(undefined)
    if (
      !loading &&
      (isSearched || isFiltered) &&
      event.deltaY > 0 &&
      !sourceKeysFetch &&
      nextCursor !== '0' &&
      previousResultCount === 0
    ) {
      clearTimeout(wheelTimer)
      wheelTimer = window.setTimeout(() => {
        onLoadMoreItems({ stopIndex: SCAN_COUNT_DEFAULT, startIndex: 1 })
      }, 100)
    }
  }

  const handleDeletePopoverOpen = (
    index: Maybe<number>,
    type: KeyTypes | ModulesKeyTypes,
  ) => {
    if (index !== deletePopoverIndex) {
      sendEventTelemetry({
        event: TelemetryEvent.BROWSER_KEY_DELETE_CLICKED,
        eventData: {
          databaseId: instanceId,
          keyType: type,
          source: 'keyList',
        },
      })
    }
    setDeletePopoverIndex(index !== deletePopoverIndex ? index : undefined)
  }

  const handleRemoveKey = (key: RedisResponseBuffer) => {
    dispatch(
      deleteKeyAction(key, () => {
        setDeletePopoverIndex(undefined)
        onDelete(key)
      }),
    )
  }

  const setScrollTopPosition = useCallback(
    (position: number) => {
      if (searchMode === SearchMode.Pattern) {
        dispatch(setBrowserPatternScrollPosition(position))
      } else {
        dispatch(setBrowserRedisearchScrollPosition(position))
      }
    },
    [searchMode],
  )

  const formatItem = useCallback(
    (item: GetKeyInfoResponse) => ({
      ...item,
      nameString: bufferToString(item.name as string),
    }),
    [],
  )

  const onRowsRendered = (startIndex: number, lastIndex: number) => {
    renderedRowsIndexesRef.current = { lastIndex, startIndex }

    const newItems = bufferFormatRows(startIndex, lastIndex)

    getMetadata(startIndex, newItems)
    rerender({})
  }

  const onRowsRenderedOverscan = (startIndex: number, lastIndex: number) => {
    const { startIndex: prevStartIndex, lastIndex: prevLastIndex } =
      renderedRowsIndexesRef.current
    if (prevStartIndex === startIndex && prevLastIndex === lastIndex) return

    onRowsRendered(startIndex, lastIndex)
  }
  const onRowsRenderedDebounced = debounce(onRowsRenderedOverscan, 100)

  const bufferFormatRows = (
    startIndex: number,
    lastIndex: number,
  ): IKeyPropTypes[] => {
    const newItems = bufferFormatRangeItems(
      itemsRef.current,
      startIndex,
      lastIndex,
      formatItem,
    )
    itemsRef.current.splice(startIndex, newItems.length, ...newItems)

    return newItems
  }

  const getMetadata = useCallback(
    (
      initialStartIndex: number,
      itemsInit: IKeyPropTypes[] = [],
      forceRefresh?: boolean,
    ): void => {
      const isSomeNotUndefined = ({ type, size, length }: IKeyPropTypes) =>
        (!commonFilterType && !isUndefined(type)) ||
        !isUndefined(size) ||
        !isUndefined(length)

      let startIndex = initialStartIndex
      let itemsToProcess = itemsInit

      if (!forceRefresh) {
        const firstEmptyItemIndex = findIndex(
          itemsInit,
          (item) => !isSomeNotUndefined(item),
        )
        if (firstEmptyItemIndex === -1) return

        startIndex = initialStartIndex + firstEmptyItemIndex
        itemsToProcess = itemsInit.slice(firstEmptyItemIndex)
      }

      const itemsToFetch = forceRefresh
        ? itemsToProcess
        : reject(itemsToProcess, isSomeNotUndefined)

      dispatch(
        fetchKeysMetadata(
          itemsToFetch.map(({ name }) => name),
          commonFilterType,
          controller.current?.signal,
          (loadedItems) => onSuccessFetchedMetadata(startIndex, loadedItems),
          () => {
            rerender({})
          },
        ),
      )
    },
    [commonFilterType],
  )

  const onSuccessFetchedMetadata = (
    startIndex: number,
    loadedItems: GetKeyInfoResponse[],
  ) => {
    const items = loadedItems.map(formatItem)
    itemsRef.current.splice(startIndex, items.length, ...items)

    rerender({})
  }

  const isTtlTheLastColumn = !visibleColumns.includes(BrowserColumns.Size)
  const ttlColumnSize = isTtlTheLastColumn ? 146 : 86

  const columns: ITableColumn[] = [
    {
      id: 'type',
      label: 'Type',
      absoluteWidth: 'auto',
      minWidth: 126,
      render: (cellData: any, { nameString }: any) => (
        <KeyRowType type={cellData} nameString={nameString} />
      ),
    },
    {
      id: 'nameString',
      label: 'Key',
      minWidth: 94,
      truncateText: true,
      render: (
        _cellData: string,
        { name, type }: IKeyPropTypes,
        _expanded,
        rowIndex,
      ) => {
        const nameString = keyFormatConvertor(name)
        return (
          <>
            <KeyRowName nameString={nameString} shortName={nameString} />
            {columns[columns.length - 1].id === 'nameString' && (
              <DeleteKeyPopover
                deletePopoverId={deletePopoverIndex}
                nameString={nameString}
                name={name}
                type={type}
                rowId={rowIndex || 0}
                onDelete={handleRemoveKey}
                onOpenPopover={handleDeletePopoverOpen}
              />
            )}
          </>
        )
      },
    },
    visibleColumns.includes(BrowserColumns.TTL)
      ? {
          id: 'ttl',
          label: 'TTL',
          absoluteWidth: ttlColumnSize,
          minWidth: ttlColumnSize,
          truncateText: true,
          alignment: TableCellAlignment.Right,
          render: (
            cellData: number,
            { nameString, name, type }: IKeyPropTypes,
            _expanded,
            rowIndex,
          ) => (
            <>
              <KeyRowTTL
                ttl={cellData}
                nameString={nameString}
                deletePopoverId={deletePopoverIndex}
                rowId={rowIndex || 0}
              />
              {isTtlTheLastColumn && (
                <DeleteKeyPopover
                  deletePopoverId={deletePopoverIndex}
                  nameString={nameString}
                  name={name}
                  type={type}
                  rowId={rowIndex || 0}
                  onDelete={handleRemoveKey}
                  onOpenPopover={handleDeletePopoverOpen}
                />
              )}
            </>
          ),
        }
      : null,
    visibleColumns.includes(BrowserColumns.Size)
      ? {
          id: 'size',
          label: 'Size',
          absoluteWidth: 90,
          minWidth: 90,
          alignment: TableCellAlignment.Right,
          textAlignment: TableCellTextAlignment.Right,
          render: (
            cellData: number,
            { nameString, name, type }: IKeyPropTypes,
            _expanded,
            rowIndex,
          ) => (
            <>
              <KeyRowSize
                size={cellData}
                nameString={nameString}
                deletePopoverId={deletePopoverIndex}
                rowId={rowIndex || 0}
              />
              {columns[columns.length - 1].id === 'size' && (
                <DeleteKeyPopover
                  deletePopoverId={deletePopoverIndex}
                  nameString={nameString}
                  name={name}
                  type={type}
                  rowId={rowIndex || 0}
                  onDelete={handleRemoveKey}
                  onOpenPopover={handleDeletePopoverOpen}
                />
              )}
            </>
          ),
        }
      : null,
  ].filter((el) => !!el)

  const noItemsMessage = NoItemsMessage()

  const VirtualizeTable = () => (
    <VirtualTable
      selectable
      onRowClick={selectKey}
      headerHeight={0}
      rowHeight={43}
      threshold={50}
      columns={columns}
      cellCache={cellCache}
      loadMoreItems={onLoadMoreItems}
      onWheel={onWheelSearched}
      loading={loading || !firstDataLoaded}
      items={itemsRef.current}
      totalItemsCount={keysState.total ?? Infinity}
      scanned={isSearched || isFiltered ? keysState.scanned : 0}
      noItemsMessage={noItemsMessage}
      selectedKey={selectedKey.data}
      scrollTopProp={scrollTopPosition}
      setScrollTopPosition={setScrollTopPosition}
      hideFooter={hideFooter}
      onRowsRendered={({ overscanStartIndex, overscanStopIndex }) =>
        onRowsRenderedDebounced(overscanStartIndex, overscanStopIndex)
      }
    />
  )

  return (
    <S.Page>
      <S.Content>
        <S.Table $withoutFooter={hideFooter}>
          <S.KeyListTable data-testid="keyList-table">
            {searchMode === SearchMode.Pattern && VirtualizeTable()}
            {searchMode !== SearchMode.Pattern && VirtualizeTable()}
          </S.KeyListTable>
        </S.Table>
      </S.Content>
    </S.Page>
  )
})

export default React.memo(KeyList)
