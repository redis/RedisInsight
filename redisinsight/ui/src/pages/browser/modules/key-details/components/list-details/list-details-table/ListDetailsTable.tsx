import React, { Ref, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { isNull, isNumber } from 'lodash'
import { CellMeasurerCache } from 'react-virtualized'
import {
  appContextBrowserKeyDetails,
  updateKeyDetailsSizes,
} from 'uiSrc/slices/app/context'
import { RiTooltip } from 'uiSrc/components'

import {
  listSelector,
  listDataSelector,
  fetchListElements,
  fetchMoreListElements,
  updateListElementAction,
  updateListValueStateSelector,
  fetchSearchingListElementAction,
} from 'uiSrc/slices/browser/list'
import {
  ITableColumn,
  IColumnSearchState,
  RelativeWidthSizes,
} from 'uiSrc/components/virtual-table/interfaces'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  sendEventTelemetry,
  TelemetryEvent,
  getBasedOnViewTypeEvent,
} from 'uiSrc/telemetry'
import {
  KeyTypes,
  OVER_RENDER_BUFFER_COUNT,
  TableCellAlignment,
  TEXT_INVALID_VALUE,
  TEXT_DISABLED_FORMATTER_EDITING,
  TEXT_UNPRINTABLE_CHARACTERS,
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_FAILED_CONVENT_FORMATTER,
  TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
} from 'uiSrc/constants'
import {
  bufferToString,
  formatLongName,
  formattingBuffer,
  isFormatEditable,
  isNonUnicodeFormatter,
  isEqualBuffers,
  stringToBuffer,
  stringToSerializedBufferFormat,
  validateListIndex,
  Nullable,
  createTooltipContent,
  bufferToSerializedFormat,
  isTruncatedString,
} from 'uiSrc/utils'
import {
  selectedKeyDataSelector,
  keysSelector,
  selectedKeySelector,
  setSelectedKeyRefreshDisabled,
} from 'uiSrc/slices/browser/keys'
import { NoResultsFoundText } from 'uiSrc/constants/texts'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { getColumnWidth } from 'uiSrc/components/virtual-grid'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'

import {
  EditableTextArea,
  FormattedValue,
} from 'uiSrc/pages/browser/modules/key-details/shared'
import { Text } from 'uiSrc/components/base/text'
import {
  SetListElementDto,
  SetListElementResponse,
} from 'apiSrc/modules/browser/list/dto'

import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 43
const footerHeight = 0
const initSearchingIndex = null

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

interface IListElement extends SetListElementResponse {}

const ListDetailsTable = () => {
  const { loading } = useSelector(listSelector)
  const { loading: updateLoading } = useSelector(updateListValueStateSelector)
  const {
    elements: loadedElements,
    total,
    searchedIndex,
  } = useSelector(listDataSelector)
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { id: instanceId, compressor = null } = useSelector(
    connectedInstanceSelector,
  )
  const { viewType } = useSelector(keysSelector)
  const { viewFormat: viewFormatProp, lastRefreshTime } =
    useSelector(selectedKeySelector)
  const { [KeyTypes.List]: listSizes } = useSelector(
    appContextBrowserKeyDetails,
  )

  const [elements, setElements] = useState<IListElement[]>([])
  const [width, setWidth] = useState(100)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [editingIndex, setEditingIndex] = useState<Nullable<number>>(null)
  const [viewFormat, setViewFormat] = useState(viewFormatProp)

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)
  const tableRef: Ref<any> = useRef(null)

  const dispatch = useDispatch()

  useEffect(() => {
    resetState()
  }, [lastRefreshTime])

  useEffect(() => {
    setElements(loadedElements)

    if (loadedElements.length < elements.length) {
      formattedLastIndexRef.current = 0
    }

    if (viewFormat !== viewFormatProp) {
      resetState()
    }
  }, [loadedElements, viewFormatProp])

  const resetState = () => {
    setExpandedRows([])
    setViewFormat(viewFormatProp)
    setEditingIndex(null)
    dispatch(setSelectedKeyRefreshDisabled(false))

    clearCache()
  }

  const clearCache = (rowIndex?: number) => {
    if (isNumber(rowIndex)) {
      cellCache.clear(rowIndex, 1)
      tableRef.current?.recomputeRowHeights(rowIndex)
      return
    }

    cellCache.clearAll()
  }

  const handleEditElement = useCallback(
    (index: number, editing: boolean) => {
      setEditingIndex(editing ? index : null)
      dispatch(setSelectedKeyRefreshDisabled(editing))

      clearCache(index)
    },
    [cellCache, viewFormat],
  )

  const handleApplyEditElement = (index = 0, value: string) => {
    const data: SetListElementDto = {
      keyName: key,
      element: stringToSerializedBufferFormat(viewFormat, value),
      index,
    }
    dispatch(updateListElementAction(data, () => onElementEditedSuccess(index)))
  }

  const onElementEditedSuccess = (elementIndex = 0) => {
    handleEditElement(elementIndex, false)
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    formattedLastIndexRef.current = 0
    const indexColumn = search.find((column) => column.id === 'index')
    const onSuccess = () => {
      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          viewType,
          TelemetryEvent.BROWSER_KEY_VALUE_FILTERED,
          TelemetryEvent.TREE_VIEW_KEY_VALUE_FILTERED,
        ),
        eventData: {
          databaseId: instanceId,
          keyType: KeyTypes.List,
          match: 'EXACT_VALUE_NAME',
        },
      })
    }

    if (!indexColumn?.value) {
      dispatch(fetchListElements(key, 0, SCAN_COUNT_DEFAULT))
      return
    }

    if (indexColumn) {
      const { value } = indexColumn
      dispatch(
        fetchSearchingListElementAction(
          key,
          value ? +value : initSearchingIndex,
          onSuccess,
        ),
      )
    }
  }

  const handleRowToggleViewClick = (expanded: boolean, rowIndex: number) => {
    const browserViewEvent = expanded
      ? TelemetryEvent.BROWSER_KEY_FIELD_VALUE_EXPANDED
      : TelemetryEvent.BROWSER_KEY_FIELD_VALUE_COLLAPSED
    const treeViewEvent = expanded
      ? TelemetryEvent.TREE_VIEW_KEY_FIELD_VALUE_EXPANDED
      : TelemetryEvent.TREE_VIEW_KEY_FIELD_VALUE_COLLAPSED

    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(viewType, browserViewEvent, treeViewEvent),
      eventData: {
        keyType: KeyTypes.List,
        databaseId: instanceId,
        largestCellLength: elements[rowIndex]?.element?.length || 0,
      },
    })

    cellCache.clearAll()
  }

  const onColResizeEnd = (sizes: RelativeWidthSizes) => {
    dispatch(
      updateKeyDetailsSizes({
        type: KeyTypes.List,
        sizes,
      }),
    )
  }

  const columns: ITableColumn[] = [
    {
      id: 'index',
      label: 'Index',
      minWidth: 120,
      relativeWidth: listSizes?.index || 30,
      truncateText: true,
      isSearchable: true,
      isResizable: true,
      prependSearchName: 'Index:',
      initialSearchValue: '',
      searchValidation: validateListIndex,
      className: 'value-table-separate-border',
      headerClassName: 'value-table-separate-border',
      render: function Index(_name: string, { index }: IListElement) {
        // Better to cut the long string, because it could affect virtual scroll performance
        const cellContent = index?.toString().substring(0, 200)
        const tooltipContent = formatLongName(index?.toString())
        return (
          <Text color="secondary" style={{ maxWidth: '100%' }}>
            <div
              style={{ display: 'flex' }}
              className="truncateText"
              data-testid={`list-index-value-${index}`}
            >
              <RiTooltip
                title="Index"
                className={styles.tooltip}
                anchorClassName="truncateText"
                position="bottom"
                content={tooltipContent}
              >
                <>{cellContent}</>
              </RiTooltip>
            </div>
          </Text>
        )
      },
    },
    {
      id: 'element',
      label: 'Element',
      minWidth: 150,
      truncateText: true,
      alignment: TableCellAlignment.Left,
      className: 'noPadding',
      render: function Element(
        _element: string,
        { element: elementItem, index }: IListElement,
        expanded: boolean = false,
        rowIndex = 0,
      ) {
        const { value: decompressedElementItem, isCompressed } =
          decompressingBuffer(elementItem, compressor)
        const isTruncatedValue = isTruncatedString(elementItem)
        const element = bufferToString(elementItem)
        const { value, isValid } = formattingBuffer(
          decompressedElementItem,
          viewFormatProp,
          { expanded },
        )
        const disabled =
          !isNonUnicodeFormatter(viewFormat, isValid) &&
          !isEqualBuffers(elementItem, stringToBuffer(element))
        const isEditable =
          !isCompressed && isFormatEditable(viewFormat) && !isTruncatedValue
        const isEditing = index === editingIndex

        const tooltipContent = createTooltipContent(
          value,
          decompressedElementItem,
          viewFormatProp,
        )
        const editTooltipContent = isCompressed
          ? TEXT_DISABLED_COMPRESSED_VALUE
          : isTruncatedValue
            ? TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA
            : TEXT_DISABLED_FORMATTER_EDITING
        const serializedValue = isEditing
          ? bufferToSerializedFormat(viewFormat, elementItem, 4)
          : ''

        return (
          <EditableTextArea
            initialValue={serializedValue}
            isLoading={updateLoading}
            isDisabled={disabled}
            isEditing={isEditing}
            isEditDisabled={!isEditable || updateLoading}
            disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
            onDecline={() => handleEditElement(index, false)}
            onApply={(value) => handleApplyEditElement(index, value)}
            approveText={TEXT_INVALID_VALUE}
            approveByValidation={(value) =>
              formattingBuffer(
                stringToSerializedBufferFormat(viewFormat, value),
                viewFormat,
              )?.isValid
            }
            onEdit={(isEditing) => handleEditElement(index, isEditing)}
            editToolTipContent={!isEditable ? editTooltipContent : null}
            onUpdateTextAreaHeight={() => clearCache(rowIndex)}
            field={index.toString()}
            testIdPrefix="list"
          >
            <div className="innerCellAsCell">
              <FormattedValue
                value={value}
                expanded={expanded}
                title={
                  isValid
                    ? 'Element'
                    : TEXT_FAILED_CONVENT_FORMATTER(viewFormatProp)
                }
                tooltipContent={tooltipContent}
              />
            </div>
          </EditableTextArea>
        )
      },
    },
  ]

  const loadMoreItems = ({ startIndex, stopIndex }: any) => {
    if (isNull(searchedIndex)) {
      dispatch(
        fetchMoreListElements(key, startIndex, stopIndex - startIndex + 1),
      )
    }
  }

  return (
    <div
      data-testid="list-details"
      className={cx(
        'key-details-table',
        'list-elements-container',
        styles.container,
      )}
    >
      <VirtualTable
        autoHeight
        hideProgress
        expandable
        tableRef={tableRef}
        selectable={false}
        keyName={key}
        headerHeight={headerHeight}
        rowHeight={rowHeight}
        footerHeight={footerHeight}
        onChangeWidth={setWidth}
        columns={columns.map((column, i, arr) => ({
          ...column,
          width: getColumnWidth(i, width, arr),
        }))}
        loadMoreItems={loadMoreItems}
        loading={loading}
        items={elements}
        totalItemsCount={total}
        noItemsMessage={NoResultsFoundText}
        onSearch={handleSearch}
        cellCache={cellCache}
        onRowToggleViewClick={handleRowToggleViewClick}
        expandedRows={expandedRows}
        setExpandedRows={setExpandedRows}
        onColResizeEnd={onColResizeEnd}
      />
    </div>
  )
}

export { ListDetailsTable }
