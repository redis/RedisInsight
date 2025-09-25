import React, { useCallback, useEffect, useRef, useState } from 'react'
import cx from 'classnames'
import { findIndex, isNumber, sumBy, xor } from 'lodash'
import {
  CellMeasurer,
  CellMeasurerCache,
  Column,
  IndexRange,
  InfiniteLoader,
  RowMouseEventHandlerParams,
  Table,
  TableCellProps,
} from 'react-virtualized'
import TableColumnSearchTrigger from 'uiSrc/components/table-column-search-trigger/TableColumnSearchTrigger'
import TableColumnSearch from 'uiSrc/components/table-column-search/TableColumnSearch'
import { SortOrder } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'

import { isEqualBuffers, Maybe, Nullable } from 'uiSrc/utils'

import { Text } from 'uiSrc/components/base/text'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { RIResizeObserver } from 'uiSrc/components/base/utils'
import { ProgressBarLoader } from 'uiSrc/components/base/display'
import {
  ColumnWidthSizes,
  IColumnSearchState,
  IProps,
  IResizeEvent,
  ITableColumn,
  ResizableState,
} from './interfaces'
import KeysSummary from '../keys-summary'

import styles from './styles.module.scss'

// this is needed to align content when scrollbar appears
const TABLE_OUTSIDE_WIDTH = 24

const VirtualTable = (props: IProps) => {
  const {
    autoHeight,
    tableRef,
    selectable = false,
    expandable = false,
    headerHeight = 44,
    rowHeight = 40,
    scanned = 0,
    threshold = 100,
    totalItemsCount = 0,
    onRowClick = () => {},
    onSearch = () => {},
    onChangeSorting = () => {},
    onRowToggleViewClick = () => {},
    sortedColumn = null,
    selectedKey = null,
    noItemsMessage = 'No keys to display.',
    searching,
    loading,
    columns,
    items,
    disableScroll,
    onWheel,
    keyName,
    loadMoreItems,
    setScrollTopPosition = () => {},
    scrollTopProp = 0,
    hideFooter = false,
    tableWidth = 0,
    hideProgress,
    onChangeWidth = () => {},
    expandedRows = [],
    setExpandedRows = () => {},
    onRowsRendered: onRowsRenderedProps,
    cellCache = new CellMeasurerCache({
      fixedWidth: true,
      minHeight: rowHeight,
    }),
    onColResizeEnd,
  } = props
  let selectTimer: number = 0
  const selectTimerDelay = 300
  let preventSelect = false

  const scrollTopRef = useRef<number>(0)
  const resizeColRef = useRef<ResizableState>({
    column: null,
    active: false,
    x: 0,
  })

  const [selectedRowIndex, setSelectedRowIndex] =
    useState<Nullable<number>>(null)
  const [search, setSearch] = useState<IColumnSearchState[]>([])
  const [width, setWidth] = useState<number>(100)
  const [height, setHeight] = useState<number>(100)
  const [forceScrollTop, setForceScrollTop] =
    useState<Maybe<number>>(scrollTopProp)
  const [columnWidthSizes, setColumnWidthSizes] =
    useState<Nullable<ColumnWidthSizes>>(null)
  const [isColResizing, setIsColResizing] = useState(false)
  const [, forceUpdate] = useState({})

  const [minWidthAllCols, setMinWidthAllCols] = useState<number>(0)

  useEffect(() => {
    const searchableFields: ITableColumn[] = columns.filter(
      (column: ITableColumn) => column.isSearchable,
    )
    searchableFields.forEach((column) => {
      setSearch([
        ...search,
        {
          id: column.id,
          value: column.initialSearchValue ?? '',
          initialSearchValue: column.initialSearchValue ?? '',
          isOpened: !!column.staySearchAlwaysOpen || !!column.isSearchOpen,
          staySearchAlwaysOpen: !!column.staySearchAlwaysOpen,
          prependSearchName: column.prependSearchName ?? '',
          searchValidation: column.searchValidation,
        },
      ])
    })

    return () => {
      setScrollTopPosition(scrollTopRef.current)
      setExpandedRows([])
      cellCache?.clearAll()
    }
  }, [])

  useEffect(() => {
    setMinWidthAllCols(sumBy(columns, (col) => col?.minWidth || 0))
  }, [columns])

  useEffect(() => {
    if (forceScrollTop !== undefined) {
      setForceScrollTop(undefined)
    }
  }, [forceScrollTop])

  useEffect(() => {
    const selectedRowIndex = selectedKey
      ? findIndex(items, ({ name }) => isEqualBuffers(name, selectedKey.name))
      : null
    setSelectedRowIndex(
      isNumber(selectedRowIndex) && selectedRowIndex > -1
        ? selectedRowIndex
        : null,
    )
  }, [selectedKey, items])

  useEffect(() => {
    setExpandedRows([])
    cellCache?.clearAll()
  }, [totalItemsCount])

  const clearSelectTimeout = (timer: number = 0) => {
    clearTimeout(timer || selectTimer)
    preventSelect = true
  }

  const clearCache = () =>
    setTimeout(() => {
      cellCache.clearAll()
      forceUpdate({})
    }, 0)

  const getWidthOfColumn = (
    colId: string,
    colWidth: number,
    width: number,
    isRelative = false,
  ) => {
    let newColWidth = isRelative ? (colWidth / 100) * width : colWidth

    const currentColumn = columns.find((col) => col.id === colId)
    const maxWidthFromTable =
      width -
      (minWidthAllCols - (currentColumn?.minWidth || 0)) -
      TABLE_OUTSIDE_WIDTH
    const maxWidth = currentColumn?.maxWidth || maxWidthFromTable
    const minWidth = currentColumn?.minWidth || 60

    if (newColWidth > maxWidth) newColWidth = maxWidth
    if (newColWidth < minWidth) newColWidth = minWidth

    const newAbsWidth = Math.floor(newColWidth)
    return {
      abs: newAbsWidth,
      relative: (newAbsWidth / width) * 100,
    }
  }

  const onRowSelect = (data: RowMouseEventHandlerParams) => {
    const isRowSelectable = checkIfRowSelectable(data.rowData)

    onRowClick(data)
    if (isRowSelectable && selectable) {
      setSelectedRowIndex(data.index)
    }

    if (isRowSelectable && expandable) {
      selectTimer = window.setTimeout(
        () => {
          const textSelected = window.getSelection()?.toString()
          if (!preventSelect && !textSelected) {
            setExpandedRows(xor(expandedRows, [data.index]))
            onRowToggleViewClick?.(
              expandedRows.indexOf(data.index) === -1,
              data.index,
            )

            clearCache()
            setTimeout(() => {
              clearCache()
            }, 0)
          }
          preventSelect = false
        },
        selectTimerDelay,
        cellCache,
      )

      if (data.event?.detail === 3) {
        clearSelectTimeout(selectTimer)
        preventSelect = false
      }

      cellCache.clearAll()
    }
  }

  const onScroll = useCallback(
    ({ scrollTop }: { scrollTop: number }) => {
      scrollTopRef.current = scrollTop
    },
    [scrollTopRef],
  )

  const onResize = ({ height, width }: IResizeEvent): void => {
    setHeight(height)
    setWidth(Math.floor(width))
    onChangeWidth?.(width)

    if (!columnWidthSizes) {
      // init width sizes
      setColumnWidthSizes(
        columns
          .filter((col) => col.isResizable)
          .reduce((prev, next) => {
            const propAbsWidth =
              next.absoluteWidth && isNumber(next.absoluteWidth)
                ? next.absoluteWidth
                : 0
            return {
              ...prev,
              [next.id]: next.relativeWidth
                ? getWidthOfColumn(next.id, next.relativeWidth, width, true)
                : getWidthOfColumn(next.id, propAbsWidth, width),
            }
          }, {}),
      )
    }

    if (columnWidthSizes) {
      setColumnWidthSizes((colWidthSizesPrev) => {
        const newSizes: ColumnWidthSizes = {}
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const col in colWidthSizesPrev) {
          newSizes[col] = getWidthOfColumn(
            col,
            colWidthSizesPrev[col].relative,
            width,
            true,
          )
        }
        return newSizes
      })
    }

    cellCache?.clearAll()
  }

  const onDragColumn = (e: React.MouseEvent) => {
    const { column, x, active } = resizeColRef.current
    if (active && column) {
      const diffX = x - e.clientX
      setColumnWidthSizes((prev) => {
        if (!prev) return null

        resizeColRef.current.x = e.clientX
        return {
          ...prev,
          [column]: getWidthOfColumn(column, prev[column].abs - diffX, width),
        }
      })

      cellCache?.clearAll()
    }
  }

  const onDragColumnStart = (e: React.MouseEvent, column: ITableColumn) => {
    resizeColRef.current = {
      column: column.id,
      active: true,
      x: e.clientX,
    }
    setIsColResizing(true)
  }

  const onDragColumnEnd = () => {
    if (resizeColRef.current.active) {
      resizeColRef.current = {
        active: false,
        column: null,
        x: 0,
      }
      setIsColResizing(false)
      cellCache?.clearAll()

      if (columnWidthSizes) {
        onColResizeEnd?.(
          Object.keys(columnWidthSizes).reduce(
            (prev, next) => ({
              ...prev,
              [next]: columnWidthSizes[next].relative,
            }),
            {},
          ),
        )
      }
    }
  }

  const checkIfRowSelectable = (rowData: any) => !!rowData

  const cellRenderer = ({
    cellData,
    columnIndex,
    rowData,
    rowIndex,
    parent,
    dataKey,
  }: TableCellProps) => {
    const column = columns[columnIndex]
    if (column.render) {
      return (
        <CellMeasurer
          cache={cellCache}
          columnIndex={columnIndex}
          rowIndex={rowIndex}
          parent={parent}
          key={rowIndex + columnIndex + dataKey}
        >
          <div
            className={styles.tableRowCell}
            style={{
              justifyContent: column.alignment,
              wordBreak: 'break-word',
            }}
            role="presentation"
          >
            {column?.render?.(
              cellData,
              rowData,
              expandedRows.indexOf(rowIndex) !== -1,
              rowIndex,
            )}
          </div>
        </CellMeasurer>
      )
    }
    return (
      <CellMeasurer
        cache={cellCache}
        columnIndex={columnIndex}
        rowIndex={rowIndex}
        parent={parent}
        key={rowIndex + columnIndex + dataKey}
      >
        <div
          className={styles.tableRowCell}
          style={{ justifyContent: column.alignment, whiteSpace: 'normal' }}
        >
          <Text style={{ maxWidth: '100%' }}>
            <div
              style={{ display: 'flex' }}
              className={column.truncateText ? 'truncateText' : ''}
            >
              {cellData}
            </div>
          </Text>
        </div>
      </CellMeasurer>
    )
  }

  const changeSorting = (column: any) => {
    if (
      !sortedColumn ||
      !sortedColumn.column ||
      sortedColumn.column !== column
    ) {
      onChangeSorting(column, SortOrder.DESC)
      return
    }
    onChangeSorting(
      column,
      sortedColumn.order === SortOrder.DESC ? SortOrder.ASC : SortOrder.DESC,
    )
  }

  const headerRenderer = ({ columnIndex, cellClass = '' }: any) => {
    const column = columns[columnIndex]
    const isColumnSorted = sortedColumn && sortedColumn.column === column.id

    return (
      <div
        className="flex-row fluid"
        style={{ justifyContent: column.alignment, position: 'relative' }}
      >
        {column.isSortable && !searching && (
          <div
            className={styles.headerCell}
            style={{ justifyContent: column.alignment }}
          >
            <button
              type="button"
              onClick={() => changeSorting(column.id)}
              className={cx(
                cellClass,
                styles.headerButton,
                isColumnSorted ? styles.headerButtonSorted : null,
              )}
              data-testid="score-button"
              style={{ justifyContent: column.alignment }}
            >
              <Text size="m" className={cellClass}  variant="semiBold">
                <span>{column.label}</span>
              </Text>
            </button>
          </div>
        )}
        {(!column.isSortable || (column.isSortable && searching)) && (
          <div
            className={cx(styles.headerCell, cellClass, 'relative')}
            style={{ flex: '1' }}
          >
            <div
              style={{
                justifyContent: column.alignment,
                textAlign: column.textAlignment,
                flex: '1',
              }}
            >
              <Text size="m" className={cellClass} variant="semiBold">
                <span>{column.label}</span>
              </Text>
            </div>
            {column.isSearchable && searchRenderer(column)}
          </div>
        )}
        {isColumnSorted && !searching && (
          <div className={styles.headerCell} style={{ paddingLeft: 0 }}>
            <button
              type="button"
              onClick={() => changeSorting(column.id)}
              className={cx(
                styles.headerButton,
                isColumnSorted ? styles.headerButtonSorted : null,
              )}
              data-testid="header-sorting-button"
            >
              <RiIcon
                style={{ marginLeft: '4px' }}
                type={
                  sortedColumn?.order === SortOrder.DESC
                    ? 'ArrowDownIcon'
                    : 'ArrowUpIcon'
                }
              />
            </button>
          </div>
        )}
        {column.isResizable && (
          <div
            className={styles.resizeTrigger}
            onMouseDown={(e) => onDragColumnStart(e, column)}
            data-testid={`resize-trigger-${column.id}`}
            role="presentation"
          />
        )}
      </div>
    )
  }

  const noRowsRenderer = () => (
    <>
      {noItemsMessage && (
        <div className={styles.placeholder}>
          <Text textAlign="center" size="m">
            <div>{loading ? 'loading...' : noItemsMessage}</div>
          </Text>
        </div>
      )}
    </>
  )

  const loadMoreRows = async (params: IndexRange): Promise<any> => {
    const { startIndex, stopIndex } = params

    // We do not load more results for first load
    if (forceScrollTop !== undefined) return

    if (!loading) {
      loadMoreItems?.({ keyName, startIndex, stopIndex })
    }
  }

  const isRowLoaded = ({ index }: any) => !!items[index]

  const handleColumnSearchVisibility = (
    columnId: string,
    isOpened: boolean,
  ) => {
    const newSearch = search.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          isOpened,
        }
      }
      return column
    })
    setSearch(newSearch)
  }

  const handleColumnSearchApply = (columnId: string, value: string) => {
    const newState = search.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          isOpened: !!value,
          value,
        }
      }
      return column
    })
    setSearch(newState)
    onSearch?.(newState)
  }

  const searchRenderer = (column: ITableColumn) => {
    const columnSearchState = search.find(
      (columnState) => columnState.id === column.id,
    )
    if (!columnSearchState) {
      return null
    }
    if (columnSearchState.staySearchAlwaysOpen) {
      return (
        <TableColumnSearch
          appliedValue={columnSearchState.value}
          fieldName={columnSearchState.id}
          onApply={(value) => handleColumnSearchApply(column.id, value)}
          prependSearchName={columnSearchState.prependSearchName}
          searchValidation={columnSearchState.searchValidation}
        />
      )
    }
    return (
      <TableColumnSearchTrigger
        appliedValue={columnSearchState.value}
        initialValue={columnSearchState.initialSearchValue}
        fieldName={columnSearchState.id}
        onApply={(value) => handleColumnSearchApply(column.id, value)}
        isOpen={columnSearchState.isOpened}
        prependSearchName={columnSearchState.prependSearchName}
        handleOpenState={(isOpen) =>
          handleColumnSearchVisibility(column.id, isOpen)
        }
        searchValidation={columnSearchState.searchValidation}
      />
    )
  }

  return (
    <RIResizeObserver onResize={onResize}>
      {(resizeRef) => (
        <div
          ref={resizeRef}
          className={cx(styles.container, {
            [styles.isResizing]: isColResizing,
          })}
          onWheel={onWheel}
          onMouseMove={onDragColumn}
          onMouseUp={onDragColumnEnd}
          onMouseLeave={onDragColumnEnd}
          role="presentation"
          data-testid="virtual-table-container"
        >
          {loading && !hideProgress && (
            <ProgressBarLoader
              color="primary"
              data-testid="progress-key-table"
            />
          )}
          <InfiniteLoader
            isRowLoaded={isRowLoaded}
            minimumBatchSize={SCAN_COUNT_DEFAULT}
            threshold={threshold}
            loadMoreRows={loadMoreRows}
            rowCount={totalItemsCount || undefined}
          >
            {({ onRowsRendered, registerChild }) => (
              <Table
                onRowClick={onRowSelect}
                onRowDoubleClick={() => clearSelectTimeout()}
                estimatedRowSize={rowHeight}
                ref={(ref) => {
                  if (tableRef) {
                    tableRef.current = ref
                  }

                  return registerChild(ref)
                }}
                headerHeight={headerHeight}
                rowHeight={cellCache.rowHeight}
                width={tableWidth > width ? tableWidth : width}
                noRowsRenderer={noRowsRenderer}
                height={height}
                className={cx(styles.table, {
                  [styles.autoHeight]: autoHeight,
                })}
                gridClassName={cx(styles.customScroll, styles.grid, {
                  [styles.disableScroll]: disableScroll,
                })}
                rowClassName={({ index }) =>
                  cx([
                    styles.tableRow,
                    {
                      'table-row-selected': selectedRowIndex === index,
                      [styles.tableRowEven]: index % 2 === 0,
                    },
                  ])
                }
                headerClassName={styles.headerColumn}
                rowCount={items.length}
                rowGetter={({ index }) => items[index]}
                onScroll={onScroll}
                scrollTop={forceScrollTop}
                deferredMeasurementCache={cellCache}
                onRowsRendered={(props) => {
                  onRowsRendered(props)
                  onRowsRenderedProps?.(props)
                }}
              >
                {columns.map((column: ITableColumn, index: number) => (
                  <Column
                    minWidth={column.minWidth}
                    maxWidth={column.maxWidth}
                    label={column.label}
                    dataKey={column.id}
                    width={
                      columnWidthSizes?.[column.id]?.abs ||
                      (column.absoluteWidth || column.relativeWidth
                        ? (column.relativeWidth ?? 0)
                        : 20)
                    }
                    flexGrow={
                      !column.absoluteWidth && !column.relativeWidth ? 1 : 0
                    }
                    headerRenderer={(headerProps) =>
                      headerRenderer({
                        ...headerProps,
                        columnIndex: index,
                        cellClass: column.headerCellClassName,
                      })
                    }
                    cellRenderer={cellRenderer}
                    headerClassName={column.headerClassName ?? ''}
                    className={cx(
                      styles.tableRowColumn,
                      column.className ?? '',
                    )}
                    key={column.id}
                  />
                ))}
              </Table>
            )}
          </InfiniteLoader>
          {!hideFooter && (
            <div className={cx(styles.tableFooter)}>
              <KeysSummary
                scanned={scanned}
                totalItemsCount={totalItemsCount || undefined}
                loading={loading}
                loadMoreItems={loadMoreItems}
                items={items}
              />
            </div>
          )}
        </div>
      )}
    </RIResizeObserver>
  )
}

export default VirtualTable
