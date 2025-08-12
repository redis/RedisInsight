import cx from 'classnames'
import React, { Ref, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { CellMeasurerCache } from 'react-virtualized'

import { isNumber, toNumber } from 'lodash'
import { Text } from 'uiSrc/components/base/text'
import { getColumnWidth } from 'uiSrc/components/virtual-grid'
import { StopPropagation } from 'uiSrc/components/virtual-table'
import {
  IColumnSearchState,
  ITableColumn,
  RelativeWidthSizes,
} from 'uiSrc/components/virtual-table/interfaces'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import {
  KeyTypes,
  OVER_RENDER_BUFFER_COUNT,
  TableCellAlignment,
  TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
  TEXT_DISABLED_COMPRESSED_VALUE,
  TEXT_DISABLED_FORMATTER_EDITING,
  TEXT_FAILED_CONVENT_FORMATTER,
  TEXT_INVALID_VALUE,
  TEXT_UNPRINTABLE_CHARACTERS,
} from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import HelpTexts from 'uiSrc/constants/help-texts'
import { NoResultsFoundText } from 'uiSrc/constants/texts'
import {
  appContextBrowserKeyDetails,
  updateKeyDetailsSizes,
} from 'uiSrc/slices/app/context'

import {
  deleteHashFields,
  fetchHashFields,
  fetchMoreHashFields,
  hashDataSelector,
  hashSelector,
  updateHashFieldsAction,
  updateHashTTLAction,
  updateHashValueStateSelector,
} from 'uiSrc/slices/browser/hash'
import {
  keysSelector,
  selectedKeyDataSelector,
  selectedKeySelector,
  setSelectedKeyRefreshDisabled,
} from 'uiSrc/slices/browser/keys'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'
import {
  getBasedOnViewTypeEvent,
  getMatchType,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import {
  bufferToSerializedFormat,
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
  createTooltipContent,
  formattingBuffer,
  isTruncatedString,
  isEqualBuffers,
  isFormatEditable,
  isNonUnicodeFormatter,
  Nullable,
  stringToSerializedBufferFormat,
  truncateNumberToDuration,
  validateTTLNumber,
} from 'uiSrc/utils'
import { stringToBuffer } from 'uiSrc/utils/formatters/bufferFormatters'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import {
  EditableInput,
  EditableTextArea,
  FormattedValue,
} from 'uiSrc/pages/browser/modules/key-details/shared'
import { RiTooltip } from 'uiSrc/components'
import {
  AddFieldsToHashDto,
  GetHashFieldsResponse,
  HashFieldDto,
  UpdateHashFieldsTtlDto,
} from 'apiSrc/modules/browser/hash/dto'

import styles from './styles.module.scss'

const suffix = '_hash'
const matchAllValue = '*'
const headerHeight = 60
const rowHeight = 43

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

interface IHashField extends HashFieldDto {}

export interface Props {
  isExpireFieldsAvailable?: boolean
  onRemoveKey: () => void
}

const HashDetailsTable = (props: Props) => {
  const { isExpireFieldsAvailable, onRemoveKey } = props

  const {
    total,
    nextCursor,
    fields: loadedFields,
  } = useSelector(hashDataSelector)
  const { loading } = useSelector(hashSelector)
  const { viewType } = useSelector(keysSelector)
  const { id: instanceId, compressor = null } = useSelector(
    connectedInstanceSelector,
  )
  const { viewFormat: viewFormatProp, lastRefreshTime } =
    useSelector(selectedKeySelector)
  const { name: key, length } = useSelector(selectedKeyDataSelector) ?? {
    name: '',
  }
  const { loading: updateLoading } = useSelector(updateHashValueStateSelector)
  const { [KeyTypes.Hash]: hashSizes } = useSelector(
    appContextBrowserKeyDetails,
  )

  const [match, setMatch] = useState<Nullable<string>>(matchAllValue)
  const [deleting, setDeleting] = useState('')
  const [fields, setFields] = useState<IHashField[]>([])
  const [editingIndex, setEditingIndex] =
    useState<Nullable<{ index: number; field: string }>>(null)
  const [width, setWidth] = useState(100)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [viewFormat, setViewFormat] = useState(viewFormatProp)

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)
  const tableRef: Ref<any> = useRef(null)

  const dispatch = useDispatch()

  useEffect(() => {
    resetState()
  }, [lastRefreshTime])

  useEffect(() => {
    setFields(loadedFields)

    if (loadedFields.length < fields.length) {
      formattedLastIndexRef.current = 0
    }

    if (viewFormat !== viewFormatProp) {
      resetState()
    }
  }, [loadedFields, viewFormatProp])

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

  const closePopover = useCallback(() => {
    setDeleting('')
  }, [])

  const showPopover = useCallback((field = '') => {
    setDeleting(`${field + suffix}`)
  }, [])

  const onSuccessRemoved = (newTotalValue: number) => {
    newTotalValue === 0 && onRemoveKey()
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_REMOVED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.Hash,
        numberOfRemoved: 1,
      },
    })
  }

  const handleDeleteField = (field: RedisString | string = '') => {
    dispatch(deleteHashFields(key, [field], onSuccessRemoved))
    closePopover()
  }

  const handleEditField = useCallback(
    (index: number, editing: boolean, field: string) => {
      setEditingIndex(editing ? { index, field } : null)
      dispatch(setSelectedKeyRefreshDisabled(editing))

      clearCache(index)
    },
    [viewFormat],
  )

  const handleApplyEditValue = (
    field = '',
    value: string,
    rowIndex: number,
  ) => {
    const data: AddFieldsToHashDto = {
      keyName: key,
      fields: [
        { field, value: stringToSerializedBufferFormat(viewFormat, value) },
      ],
    }

    dispatch(
      updateHashFieldsAction(data, () =>
        handleEditField(rowIndex, false, 'value'),
      ),
    )
  }

  const handleApplyEditExpire = (
    field = '',
    expire: string,
    rowIndex: number,
  ) => {
    const data: UpdateHashFieldsTtlDto = {
      keyName: key,
      fields: [{ field, expire: expire ? toNumber(expire) : -1 }],
    }

    dispatch(
      updateHashTTLAction(data, () => handleEditField(rowIndex, false, 'ttl')),
    )
  }

  const handleRemoveIconClick = () => {
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_REMOVE_CLICKED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVE_CLICKED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.Hash,
      },
    })
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    const fieldColumn = search.find((column) => column.id === 'field')
    if (fieldColumn) {
      const { value: match } = fieldColumn
      const onSuccess = (data: GetHashFieldsResponse) => {
        const matchValue = getMatchType(match)
        sendEventTelemetry({
          event: getBasedOnViewTypeEvent(
            viewType,
            TelemetryEvent.BROWSER_KEY_VALUE_FILTERED,
            TelemetryEvent.TREE_VIEW_KEY_VALUE_FILTERED,
          ),
          eventData: {
            databaseId: instanceId,
            keyType: KeyTypes.Hash,
            match: matchValue,
            length: data.total,
          },
        })
      }
      setMatch(match)
      dispatch(
        fetchHashFields(
          key,
          0,
          SCAN_COUNT_DEFAULT,
          match || matchAllValue,
          true,
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
        keyType: KeyTypes.Hash,
        databaseId: instanceId,
        largestCellLength:
          Math.max(
            ...Object.values(fields[rowIndex]).map((a) => a.toString().length),
          ) || 0,
      },
    })

    cellCache.clearAll()
  }

  const loadMoreItems = () => {
    if (nextCursor !== 0) {
      dispatch(
        fetchMoreHashFields(
          key as RedisResponseBuffer,
          nextCursor,
          SCAN_COUNT_DEFAULT,
          match || matchAllValue,
        ),
      )
    }
  }

  const onColResizeEnd = (sizes: RelativeWidthSizes) => {
    dispatch(
      updateKeyDetailsSizes({
        type: KeyTypes.Hash,
        sizes,
      }),
    )
  }

  const columns: ITableColumn[] = [
    {
      id: 'field',
      label: 'Field',
      isSearchable: true,
      isResizable: true,
      minWidth: 120,
      relativeWidth: hashSizes?.field || 40,
      prependSearchName: 'Field:',
      initialSearchValue: '',
      truncateText: true,
      alignment: TableCellAlignment.Left,
      className: 'value-table-separate-border',
      headerClassName: 'value-table-separate-border',
      render: (
        _name: string,
        { field: fieldItem }: HashFieldDto,
        expanded?: boolean,
      ) => {
        const { value: decompressedItem } = decompressingBuffer(
          fieldItem,
          compressor,
        )
        const field = bufferToString(fieldItem) || ''
        const { value, isValid } = formattingBuffer(
          decompressedItem,
          viewFormatProp,
          { expanded, skipVector: true },
        )
        const tooltipContent = createTooltipContent(
          value,
          decompressedItem,
          viewFormatProp,
          { skipVector: true },
        )

        return (
          <Text
            color="subdued"
            size="s"
            style={{ maxWidth: '100%', whiteSpace: 'break-spaces' }}
            component="div"
          >
            <div
              style={{ display: 'flex' }}
              data-testid={`hash-field-${field}`}
            >
              <FormattedValue
                value={value}
                expanded={expanded}
                title={
                  isValid
                    ? 'Field'
                    : TEXT_FAILED_CONVENT_FORMATTER(viewFormatProp)
                }
                tooltipContent={tooltipContent}
              />
            </div>
          </Text>
        )
      },
    },
    {
      id: 'value',
      label: 'Value',
      minWidth: 120,
      truncateText: true,
      alignment: TableCellAlignment.Left,
      className: 'noPadding',
      render: function Value(
        _name: string,
        { field: fieldItem, value: valueItem }: IHashField,
        expanded?: boolean,
        rowIndex = 0,
      ) {
        const { value: decompressedFieldItem } = decompressingBuffer(
          fieldItem,
          compressor,
        )
        const { value: decompressedValueItem, isCompressed } =
          decompressingBuffer(valueItem, compressor)
        const isTruncatedFieldOrValue =
          isTruncatedString(valueItem) || isTruncatedString(fieldItem)
        const value = bufferToString(valueItem)
        const field = bufferToString(decompressedFieldItem)
        const { value: formattedValue, isValid } = formattingBuffer(
          decompressedValueItem,
          viewFormatProp,
          { expanded },
        )
        const tooltipContent = createTooltipContent(
          formattedValue,
          decompressedValueItem,
          viewFormatProp,
        )
        const disabled =
          !isNonUnicodeFormatter(viewFormat, isValid) &&
          !isEqualBuffers(valueItem, stringToBuffer(value))
        const isEditable =
          !isCompressed &&
          isFormatEditable(viewFormat) &&
          !isTruncatedFieldOrValue
        const editTooltipContent = isCompressed
          ? TEXT_DISABLED_COMPRESSED_VALUE
          : isTruncatedFieldOrValue
            ? TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA
            : TEXT_DISABLED_FORMATTER_EDITING
        const isEditing =
          editingIndex?.field === 'value' && editingIndex?.index === rowIndex

        const serializedValue = isEditing
          ? bufferToSerializedFormat(viewFormat, valueItem, 4)
          : ''

        return (
          <EditableTextArea
            initialValue={serializedValue}
            isLoading={updateLoading}
            isDisabled={disabled}
            isEditing={isEditing}
            isEditDisabled={!isEditable || updateLoading}
            disabledTooltipText={TEXT_UNPRINTABLE_CHARACTERS}
            onDecline={() => handleEditField(rowIndex, false, 'value')}
            onApply={(value) =>
              handleApplyEditValue(fieldItem, value, rowIndex)
            }
            approveText={TEXT_INVALID_VALUE}
            approveByValidation={(value) =>
              formattingBuffer(
                stringToSerializedBufferFormat(viewFormat, value),
                viewFormat,
              )?.isValid
            }
            onEdit={(isEditing) =>
              handleEditField(rowIndex, isEditing, 'value')
            }
            editToolTipContent={!isEditable ? editTooltipContent : null}
            onUpdateTextAreaHeight={() => clearCache(rowIndex)}
            field={field}
            testIdPrefix="hash"
          >
            <div className="innerCellAsCell">
              <FormattedValue
                value={formattedValue}
                expanded={expanded}
                title={
                  isValid
                    ? 'Value'
                    : TEXT_FAILED_CONVENT_FORMATTER(viewFormatProp)
                }
                tooltipContent={tooltipContent}
              />
            </div>
          </EditableTextArea>
        )
      },
    },
    {
      id: 'actions',
      label: '',
      className: 'actions singleAction',
      absoluteWidth: 40,
      minWidth: 40,
      maxWidth: 40,
      render: function Actions(
        _act: any,
        { field: fieldItem, value: valueItem }: HashFieldDto,
        _,
      ) {
        const field = bufferToString(fieldItem, viewFormat)
        return (
          <StopPropagation>
            <PopoverDelete
              header={createDeleteFieldHeader(fieldItem as RedisString)}
              text={createDeleteFieldMessage(key ?? '')}
              item={field}
              itemRaw={fieldItem as RedisString}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={updateLoading}
              showPopover={showPopover}
              testid={`remove-hash-button-${field}`}
              handleDeleteItem={handleDeleteField}
              handleButtonClick={handleRemoveIconClick}
              appendInfo={
                length === 1 ? HelpTexts.REMOVE_LAST_ELEMENT('Field') : null
              }
            />
          </StopPropagation>
        )
      },
    },
  ]

  if (isExpireFieldsAvailable) {
    columns.splice(2, 0, {
      id: 'ttl',
      label: 'TTL',
      absoluteWidth: 140,
      minWidth: 140,
      truncateText: true,
      className: 'noPadding',
      render: function TTL(
        _name: string,
        { field: fieldItem, expire }: IHashField,
        _expanded?: boolean,
        rowIndex = 0,
      ) {
        const field = bufferToString(fieldItem, viewFormat)
        const isEditing =
          editingIndex?.field === 'ttl' && editingIndex?.index === rowIndex
        const isTruncatedFieldName = isTruncatedString(fieldItem)
        const editTooltipContent = isTruncatedFieldName
          ? TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA
          : null

        return (
          <EditableInput
            initialValue={expire === -1 ? '' : expire?.toString()}
            placeholder="Enter TTL"
            field={field}
            isEditing={isEditing}
            onEdit={(value: boolean) => handleEditField(rowIndex, value, 'ttl')}
            onDecline={() => handleEditField(rowIndex, false, 'ttl')}
            onApply={(value) => handleApplyEditExpire(fieldItem, value, 'ttl')}
            testIdPrefix="hash-ttl"
            validation={validateTTLNumber}
            isEditDisabled={isTruncatedFieldName}
            editToolTipContent={editTooltipContent}
            
          >
            <div className="innerCellAsCell">
              {expire === -1 ? (
                'No Limit'
              ) : (
                <RiTooltip
                  title="Time to Live"
                  className={styles.tooltip}
                  anchorClassName="truncateText"
                  position="right"
                  content={truncateNumberToDuration(expire || 0)}
                >
                  <>{expire}</>
                </RiTooltip>
              )}
            </div>
          </EditableInput>
        )
      },
    })
  }

  return (
    <>
      <div
        data-testid="hash-details"
        className={cx(
          'key-details-table',
          'hash-fields-container',
          styles.container,
        )}
      >
        <VirtualTable
          hideProgress
          expandable
          autoHeight
          tableRef={tableRef}
          keyName={key as RedisResponseBuffer}
          headerHeight={headerHeight}
          rowHeight={rowHeight}
          onChangeWidth={setWidth}
          columns={columns.map((column, i, arr) => ({
            ...column,
            width: getColumnWidth(i, width, arr),
          }))}
          footerHeight={0}
          overscanRowCount={10}
          loadMoreItems={loadMoreItems}
          loading={loading}
          items={fields}
          totalItemsCount={total}
          noItemsMessage={NoResultsFoundText}
          onWheel={closePopover}
          onSearch={handleSearch}
          cellCache={cellCache}
          onRowToggleViewClick={handleRowToggleViewClick}
          expandedRows={expandedRows}
          setExpandedRows={setExpandedRows}
          onColResizeEnd={onColResizeEnd}
        />
      </div>
    </>
  )
}

export { HashDetailsTable }
