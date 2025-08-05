import React, { useCallback, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import AutoSizer, { Size } from 'react-virtualized-auto-sizer'
import { isObject, xor } from 'lodash'
import InfiniteLoader from 'react-window-infinite-loader'
import { VariableSizeGrid as Grid, GridChildComponentProps } from 'react-window'

import { Maybe, Nullable } from 'uiSrc/utils'
import { SortOrder } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { RiText } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons'
import { RiProgressBarLoader } from 'uiSrc/components/base/display'
import { IProps } from './interfaces'
import { getColumnWidth, useInnerElementType } from './utils'

import styles from './styles.module.scss'

const loadingMsg = 'loading...'
let selectTimer: number = 0
const selectTimerDelay = 300
let preventSelect = false

const VirtualGrid = (props: IProps) => {
  const {
    rowHeight = 40,
    totalItemsCount = 0,
    onChangeSorting = () => {},
    onRowToggleViewClick = () => {},
    sortedColumn = null,
    noItemsMessage = 'No items to display.',
    loading,
    columns = [],
    items = [],
    onWheel,
    keyName,
    loadMoreItems,
    setScrollTopPosition = () => {},
    scrollTopProp = 0,
    maxTableWidth = 0,
    hideProgress,
    stickLastColumnHeaderCell,
  } = props

  const scrollTopRef = useRef<number>(0)
  const [width, setWidth] = useState<number>(200)
  const [height, setHeight] = useState<number>(100)
  const [forceScrollTop, setForceScrollTop] =
    useState<Maybe<number>>(scrollTopProp)
  const [expandedRows, setExpandedRows] = useState<number[]>([])

  const gridRef = useRef<Nullable<Grid>>()
  const rowHeightsMap = useRef<{ [key: number]: { [key: number]: number } }>({})
  const setRowHeight = useCallback(
    (rowIndex: number, columnIndex: number, size: number) => {
      rowHeightsMap.current = {
        ...rowHeightsMap.current,
        [rowIndex]: {
          ...(rowHeightsMap.current[rowIndex] || {}),
          [columnIndex]: size,
        },
      }

      gridRef.current?.resetAfterRowIndex?.(rowIndex)
    },
    [],
  )

  const getRowHeight = (index: number) =>
    expandedRows.indexOf(index) !== -1
      ? Math.max(...Object.values(rowHeightsMap.current[index]))
      : rowHeight

  useEffect(
    () => () => {
      setScrollTopPosition(scrollTopRef.current)
      setExpandedRows([])
    },
    [],
  )

  useEffect(() => {
    setExpandedRows([])
    rowHeightsMap.current = {}
    gridRef.current?.resetAfterRowIndex?.(0)
  }, [totalItemsCount])

  useEffect(() => {
    if (forceScrollTop !== undefined) {
      setForceScrollTop(undefined)
    }
  }, [forceScrollTop])

  const onScroll = useCallback(
    ({ scrollTop }) => {
      scrollTopRef.current = scrollTop
    },
    [scrollTopRef],
  )

  const changeSorting = (column: any) => {
    if (
      !sortedColumn ||
      !sortedColumn.column ||
      sortedColumn.column !== column
    ) {
      onChangeSorting(column, SortOrder.DESC)
      return
    }
    setExpandedRows([])
    onChangeSorting(
      column,
      sortedColumn.order === SortOrder.DESC ? SortOrder.ASC : SortOrder.DESC,
    )
  }

  const loadMoreRows = async (
    startIndex: number,
    stopIndex: number,
  ): Promise<any> => {
    // We do not load more results for first load
    if (forceScrollTop !== undefined) return

    if (!loading) {
      loadMoreItems?.({ keyName, startIndex, stopIndex })
    }
  }

  const onResize = ({ height, width }: Size): void => {
    setHeight(height)
    setWidth(width)
  }

  const onCellClick = (event: React.MouseEvent, rowIndex: number) => {
    selectTimer = window.setTimeout(() => {
      const textSelected = window.getSelection()?.toString()
      if (!preventSelect && !textSelected) {
        setExpandedRows(xor(expandedRows, [rowIndex]))

        onRowToggleViewClick?.(expandedRows.indexOf(rowIndex) === -1, rowIndex)
      }
      preventSelect = false
    }, selectTimerDelay)

    if (event?.detail === 3) {
      clearSelectTimeout(selectTimer)
      preventSelect = false
    }
  }

  const clearSelectTimeout = (timer: number = 0) => {
    clearTimeout(timer || selectTimer)
    preventSelect = true
  }

  const renderNotEmptyContent = (text: string) => text || <div>&nbsp;</div>

  const Cell = ({
    columnIndex,
    rowIndex,
    style,
  }: GridChildComponentProps<null>) => {
    const rowData = items[rowIndex]
    const column = columns[columnIndex]
    const content: string | { [key: string]: any } = rowData?.[column?.id] || ''
    const cellRef = useRef<HTMLDivElement>(null)

    const expanded = expandedRows.indexOf(rowIndex) !== -1

    React.useEffect(() => {
      if (cellRef.current) {
        const paddingSize = 24
        const cellHeight =
          cellRef.current?.children?.[0]?.getBoundingClientRect?.().height +
          paddingSize

        if (rowIndex !== 0) {
          setRowHeight(rowIndex, columnIndex, cellHeight)
        }
      }
    }, [setRowHeight, rowIndex, expanded])

    if (rowIndex === 0) {
      const isLastColumn = columns.length - 1 === columnIndex
      return (
        <hgroup className={styles.gridHeaderCell} ref={cellRef} style={style}>
          <div
            className={cx(styles.gridHeaderItem, 'truncateText', {
              [styles.lastHeaderItem]: isLastColumn,
            })}
          >
            {isObject(content) && (
              <>
                {!!content?.sortable && (
                  <button
                    type="button"
                    data-testid="header-sorting-button"
                    className={styles.gridHeaderItemSortable}
                    onClick={() => changeSorting(column.id)}
                  >
                    {content.render
                      ? content.render(content)
                      : renderNotEmptyContent(content.label)}
                    <span style={{ paddingLeft: 0 }}>
                      <RiIcon
                        style={{ marginLeft: '4px' }}
                        type={
                          sortedColumn?.order === SortOrder.DESC
                            ? 'ArrowDownIcon'
                            : 'ArrowUpIcon'
                        }
                      />
                    </span>
                  </button>
                )}
                {!content?.sortable &&
                  (content.render
                    ? content.render(content)
                    : renderNotEmptyContent(content.label))}
              </>
            )}
            {!isObject(content) && renderNotEmptyContent(content)}
          </div>
        </hgroup>
      )
    }

    if (columnIndex === 0) {
      const lastColumn = columns[columns.length - 1]
      const allDynamicRowsHeight: number[] = Object.values(
        rowHeightsMap.current,
      ).map((row) => Math.max(...Object.values(row)))

      const allRowsHeight =
        allDynamicRowsHeight.reduce((a, b) => a + b, 0) +
        (items.length - allDynamicRowsHeight.length) * rowHeight

      const hasHorizontalScrollOffset = height < allRowsHeight

      return (
        <div
          style={style}
          ref={cellRef}
          className={cx(
            styles.gridItem,
            rowIndex % 2 ? styles.gridItemOdd : styles.gridItemEven,
          )}
        >
          {column?.render &&
            isObject(rowData) &&
            column?.render(rowData, expanded)}
          {!column?.render && content}

          <div
            className={cx(
              styles.gridItem,
              styles.gridItemLast,
              rowIndex % 2 ? styles.gridItemOdd : styles.gridItemEven,
            )}
            style={{
              width: lastColumn?.minWidth,
              height: getRowHeight(rowIndex),
              marginLeft:
                width -
                lastColumn?.minWidth -
                (hasHorizontalScrollOffset ? 23 : 13),
            }}
          >
            {lastColumn?.render &&
              isObject(rowData) &&
              lastColumn?.render(rowData, expanded)}
          </div>
        </div>
      )
    }

    return (
      <div
        ref={cellRef}
        style={style}
        className={cx(
          styles.gridItem,
          rowIndex % 2 ? styles.gridItemOdd : styles.gridItemEven,
          columnIndex === columns.length - 2 ? 'penult' : '',
        )}
      >
        {column?.render &&
          isObject(rowData) &&
          column?.render(rowData, expanded)}
        {!column?.render && content}
      </div>
    )
  }

  const innerElementType = useInnerElementType(
    Cell,
    getColumnWidth,
    getRowHeight,
    columns.length - 1,
    Math.max(maxTableWidth, width),
    columns,
    { stickLastColumnHeaderCell },
  )

  return (
    <div
      className={styles.container}
      onWheel={onWheel}
      data-testid="virtual-grid-container"
    >
      {loading && !hideProgress && (
        <RiProgressBarLoader
          color="primary"
          className={styles.progress}
          data-testid="progress-entry-list"
        />
      )}
      {items.length > 1 && (
        <AutoSizer onResize={onResize}>
          {() => (
            <InfiniteLoader
              isItemLoaded={(index) => index < items.length}
              loadMoreItems={loadMoreRows}
              minimumBatchSize={SCAN_COUNT_DEFAULT}
              threshold={100}
              itemCount={totalItemsCount}
            >
              {({ onItemsRendered, ref }) => (
                <Grid
                  ref={(list) => {
                    ref(list)
                    gridRef.current = list
                  }}
                  onItemsRendered={(props) =>
                    onItemsRendered({
                      visibleStartIndex: props.visibleRowStartIndex || 0,
                      visibleStopIndex: props.visibleRowStopIndex || 0,
                      overscanStartIndex: props.overscanRowStartIndex || 0,
                      overscanStopIndex: props.overscanRowStopIndex || 0,
                    })
                  }
                  className={styles.grid}
                  columnCount={columns.length}
                  columnWidth={(i) => getColumnWidth(i, width, columns)}
                  height={height}
                  rowCount={items.length}
                  rowHeight={getRowHeight}
                  width={width}
                  innerElementType={innerElementType}
                  onScroll={onScroll}
                  initialScrollTop={forceScrollTop}
                  itemData={items}
                >
                  {({ data, rowIndex, columnIndex, style }) => (
                    <div
                      onClick={(e) => onCellClick(e, rowIndex)}
                      role="presentation"
                    >
                      <Cell
                        style={style}
                        data={data}
                        columnIndex={columnIndex}
                        rowIndex={rowIndex}
                      />
                    </div>
                  )}
                </Grid>
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      )}
      {items.length === 1 && (
        <RiText className={styles.noItems} color="subdued">
          {loading ? loadingMsg : noItemsMessage}
        </RiText>
      )}
    </div>
  )
}

export default VirtualGrid
