import React, { Ref, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { isNumber } from 'lodash'
import { CellMeasurerCache } from 'react-virtualized'

import {
  appContextBrowserKeyDetails,
  updateKeyDetailsSizes,
} from 'uiSrc/slices/app/context'
import { RiTooltip } from 'uiSrc/components'
import {
  arrayDataSelector,
  arraySelector,
  fetchArrayElements,
  fetchMoreArrayElements,
  fetchSearchingArrayElementAction,
  searchArrayElementsAction,
  updateArrayElementAction,
  updateArrayValueStateSelector,
} from 'uiSrc/slices/browser/array'
import {
  IColumnSearchState,
  ITableColumn,
  RelativeWidthSizes,
} from 'uiSrc/components/virtual-table/interfaces'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import {
  bufferToSerializedFormat,
  bufferToString,
  createTooltipContent,
  decodeEscapedText,
  formatLongName,
  formattingBuffer,
  isProbablyMarkdown,
  isEqualBuffers,
  isFormatEditable,
  isNonUnicodeFormatter,
  isTruncatedString,
  Nullable,
  stringToBuffer,
  stringToSerializedBufferFormat,
  validateArrayIndex,
} from 'uiSrc/utils'
import {
  KeyTypes,
  KeyValueFormat,
  OVER_RENDER_BUFFER_COUNT,
  TableCellAlignment,
  TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_DISABLED_FORMATTER_EDITING,
  TEXT_FAILED_CONVENT_FORMATTER,
  TEXT_INVALID_VALUE,
  TEXT_UNPRINTABLE_CHARACTERS,
} from 'uiSrc/constants'
import {
  keysSelector,
  selectedKeyDataSelector,
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
import { SetArrayElementDto } from 'apiSrc/modules/browser/array/dto'
import { ArrayElement } from 'uiSrc/slices/interfaces/array'
import MarkdownMessage from 'uiSrc/components/side-panels/panels/ai-assistant/components/shared/markdown-message'

import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 43
const footerHeight = 0

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

interface ArrayValueProps {
  expanded: boolean
  isValid: boolean
  onMarkdownRendered: () => void
  tooltipContent: string | JSX.Element
  value: string | JSX.Element
  viewFormat: KeyValueFormat
}

const ArrayValue = ({
  expanded,
  isValid,
  onMarkdownRendered,
  tooltipContent,
  value,
  viewFormat,
}: ArrayValueProps) => {
  const decodedValue =
    typeof value === 'string' ? decodeEscapedText(value) : value
  const shouldRenderMarkdown =
    typeof decodedValue === 'string' && isProbablyMarkdown(decodedValue)

  if (shouldRenderMarkdown) {
    return (
      <div className={cx(styles.markdownValue, 'jsx-markdown')}>
        <MarkdownMessage onMessageRendered={onMarkdownRendered}>
          {decodedValue}
        </MarkdownMessage>
      </div>
    )
  }

  return (
    <FormattedValue
      value={decodedValue}
      expanded={expanded}
      title={isValid ? 'Value' : TEXT_FAILED_CONVENT_FORMATTER(viewFormat)}
      tooltipContent={
        typeof decodedValue === 'string' ? decodedValue : tooltipContent
      }
    />
  )
}

const ArrayDetailsTable = () => {
  const { loading } = useSelector(arraySelector)
  const { loading: updateLoading } = useSelector(updateArrayValueStateSelector)
  const {
    elements: loadedElements,
    total,
    nextIndex,
    searchedIndex,
    match,
  } = useSelector(arrayDataSelector)
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { id: instanceId, compressor = null } = useSelector(
    connectedInstanceSelector,
  )
  const { viewType } = useSelector(keysSelector)
  const { viewFormat: viewFormatProp, lastRefreshTime } =
    useSelector(selectedKeySelector)
  const { [KeyTypes.Array]: arraySizes } = useSelector(
    appContextBrowserKeyDetails,
  )

  const [elements, setElements] = useState<ArrayElement[]>([])
  const [width, setWidth] = useState(100)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [editingIndex, setEditingIndex] = useState<Nullable<string>>(null)
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
    (index: string, editing: boolean) => {
      setEditingIndex(editing ? index : null)
      dispatch(setSelectedKeyRefreshDisabled(editing))
      clearCache(elements.findIndex((element) => element.index === index))
    },
    [cellCache, viewFormat, elements],
  )

  const handleApplyEditElement = (index = '0', value: string) => {
    const data: SetArrayElementDto = {
      keyName: key,
      value: stringToSerializedBufferFormat(viewFormat, value),
      index,
    }
    dispatch(
      updateArrayElementAction(data, () => handleEditElement(index, false)),
    )
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    formattedLastIndexRef.current = 0
    const indexColumn = search.find((column) => column.id === 'index')
    const valueColumn = search.find((column) => column.id === 'value')
    const onSuccess = () => {
      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          viewType,
          TelemetryEvent.BROWSER_KEY_VALUE_FILTERED,
          TelemetryEvent.TREE_VIEW_KEY_VALUE_FILTERED,
        ),
        eventData: {
          databaseId: instanceId,
          keyType: KeyTypes.Array,
          match: indexColumn?.value ? 'EXACT_VALUE_NAME' : 'VALUE',
        },
      })
    }

    if (indexColumn?.value) {
      dispatch(
        fetchSearchingArrayElementAction(key, indexColumn.value, onSuccess),
      )
      return
    }

    if (valueColumn?.value) {
      dispatch(
        searchArrayElementsAction(key, valueColumn.value, undefined, onSuccess),
      )
      return
    }

    dispatch(fetchArrayElements({ key, count: SCAN_COUNT_DEFAULT }))
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
        keyType: KeyTypes.Array,
        databaseId: instanceId,
        largestCellLength: elements[rowIndex]?.value?.length || 0,
      },
    })

    cellCache.clearAll()
  }

  const onColResizeEnd = (sizes: RelativeWidthSizes) => {
    dispatch(
      updateKeyDetailsSizes({
        type: KeyTypes.Array,
        sizes,
      }),
    )
  }

  const columns: ITableColumn[] = [
    {
      id: 'index',
      label: 'Index',
      minWidth: 120,
      relativeWidth: arraySizes?.index || 30,
      truncateText: true,
      isSearchable: true,
      isResizable: true,
      prependSearchName: 'Index:',
      initialSearchValue: '',
      searchValidation: validateArrayIndex,
      className: 'value-table-separate-border',
      headerClassName: 'value-table-separate-border',
      render: function Index(_name: string, { index }: ArrayElement) {
        const cellContent = index.substring(0, 200)
        const tooltipContent = formatLongName(index)
        return (
          <Text component="div" color="secondary" style={{ maxWidth: '100%' }}>
            <div
              style={{ display: 'flex' }}
              className="truncateText"
              data-testid={`array-index-value-${index}`}
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
      id: 'value',
      label: 'Value',
      minWidth: 150,
      truncateText: true,
      isSearchable: true,
      prependSearchName: 'Value:',
      alignment: TableCellAlignment.Left,
      className: 'noPadding',
      render: function Element(
        _element: string,
        { value: elementItem, index }: ArrayElement,
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
            field={index}
            testIdPrefix="array"
          >
            <div className="innerCellAsCell">
              <ArrayValue
                value={value}
                expanded={expanded}
                viewFormat={viewFormatProp}
                isValid={isValid}
                onMarkdownRendered={() => clearCache(rowIndex)}
                tooltipContent={tooltipContent}
              />
            </div>
          </EditableTextArea>
        )
      },
    },
  ]

  const loadMoreItems = () => {
    if (!searchedIndex && !match && nextIndex) {
      dispatch(fetchMoreArrayElements({ key, nextIndex }))
    }
  }

  const totalItemsCount = searchedIndex || match ? elements.length : total

  return (
    <div
      data-testid="array-details"
      className={cx(
        'key-details-table',
        'array-elements-container',
        styles.container,
      )}
    >
      <VirtualTable
        autoHeight
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
        totalItemsCount={totalItemsCount}
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

export { ArrayDetailsTable }
