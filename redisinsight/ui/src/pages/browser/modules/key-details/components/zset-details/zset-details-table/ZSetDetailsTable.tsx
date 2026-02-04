import React, { Ref, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toNumber, isNumber } from 'lodash'
import { CellMeasurerCache } from 'react-virtualized'
import {
  appContextBrowserKeyDetails,
  updateKeyDetailsSizes,
} from 'uiSrc/slices/app/context'

import {
  zsetSelector,
  fetchZSetMembers,
  fetchMoreZSetMembers,
  zsetDataSelector,
  deleteZSetMembers,
  updateZsetScoreStateSelector,
  updateZSetMembers,
  fetchSearchZSetMembers,
  fetchSearchMoreZSetMembers,
} from 'uiSrc/slices/browser/zset'
import {
  KeyTypes,
  OVER_RENDER_BUFFER_COUNT,
  SortOrder,
  TEXT_FAILED_CONVENT_FORMATTER,
  TableCellAlignment,
  TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA,
} from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import HelpTexts from 'uiSrc/constants/help-texts'
import { NoResultsFoundText } from 'uiSrc/constants/texts'
import {
  selectedKeyDataSelector,
  keysSelector,
  selectedKeySelector,
  setSelectedKeyRefreshDisabled,
} from 'uiSrc/slices/browser/keys'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'
import { ZsetMember } from 'uiSrc/slices/interfaces/zset'
import {
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
  createTooltipContent,
  formatLongName,
  formattingBuffer,
  isTruncatedString,
  isEqualBuffers,
  validateScoreNumber,
} from 'uiSrc/utils'
import {
  sendEventTelemetry,
  TelemetryEvent,
  getBasedOnViewTypeEvent,
  getMatchType,
} from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import {
  IColumnSearchState,
  ITableColumn,
  RelativeWidthSizes,
} from 'uiSrc/components/virtual-table/interfaces'
import { StopPropagation } from 'uiSrc/components/virtual-table'
import { getColumnWidth } from 'uiSrc/components/virtual-grid'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import {
  EditableInput,
  FormattedValue,
} from 'uiSrc/pages/browser/modules/key-details/shared'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { Text } from 'uiSrc/components/base/text'
import { RiTooltip } from 'uiSrc/components'
import {
  AddMembersToZSetDto,
  SearchZSetMembersResponse,
} from 'apiSrc/modules/browser/z-set/dto'

import * as S from './ZSetDetailsTable.styles'

const suffix = '_zset'
const headerHeight = 60
const rowHeight = 43

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

interface IZsetMember extends ZsetMember {
  editing: boolean
}

export interface Props {
  onRemoveKey: () => void
}

const ZSetDetailsTable = (props: Props) => {
  const { onRemoveKey } = props

  const { loading, searching } = useSelector(zsetSelector)
  const { loading: updateLoading } = useSelector(updateZsetScoreStateSelector)
  const [sortedColumnOrder, setSortedColumnOrder] = useState(SortOrder.ASC)
  const { name: key, length } = useSelector(selectedKeyDataSelector) ?? {
    name: '',
  }
  const {
    total,
    nextCursor,
    members: loadedMembers,
  } = useSelector(zsetDataSelector)
  const { id: instanceId, compressor = null } = useSelector(
    connectedInstanceSelector,
  )
  const { viewType } = useSelector(keysSelector)
  const { viewFormat: viewFormatProp } = useSelector(selectedKeySelector)
  const { [KeyTypes.ZSet]: ZSetSizes } = useSelector(
    appContextBrowserKeyDetails,
  )

  const [match, setMatch] = useState<string>('')
  const [deleting, setDeleting] = useState('')
  const [members, setMembers] = useState<IZsetMember[]>([])
  const [sortedColumnName, setSortedColumnName] = useState('score')
  const [width, setWidth] = useState(100)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [viewFormat, setViewFormat] = useState(viewFormatProp)

  const dispatch = useDispatch()

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)
  const tableRef: Ref<any> = useRef(null)

  useEffect(() => {
    const newMembers = loadedMembers.map((item) => ({
      ...item,
      editing: false,
    }))

    setMembers(newMembers)

    if (loadedMembers.length < members.length) {
      formattedLastIndexRef.current = 0
    }

    if (viewFormat !== viewFormatProp) {
      setExpandedRows([])
      setViewFormat(viewFormatProp)

      clearCache()
    }
  }, [loadedMembers, viewFormatProp])

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

  const showPopover = useCallback((member = '') => {
    setDeleting(`${member + suffix}`)
  }, [])

  const onSuccessRemoved = (newTotal: number) => {
    newTotal === 0 && onRemoveKey()
    sendEventTelemetry({
      event: getBasedOnViewTypeEvent(
        viewType,
        TelemetryEvent.BROWSER_KEY_VALUE_REMOVED,
        TelemetryEvent.TREE_VIEW_KEY_VALUE_REMOVED,
      ),
      eventData: {
        databaseId: instanceId,
        keyType: KeyTypes.ZSet,
        numberOfRemoved: 1,
      },
    })
  }

  const handleDeleteMember = (member: RedisString | string = '') => {
    dispatch(deleteZSetMembers(key, [member], onSuccessRemoved))
    closePopover()
  }

  const handleEditMember = (
    name: RedisResponseBuffer,
    editing: boolean,
    index?: number,
  ) => {
    const newMemberState = members.map((item) => {
      if (isEqualBuffers(item.name, name)) {
        return { ...item, editing }
      }
      return item
    })
    setMembers(newMemberState)
    dispatch(setSelectedKeyRefreshDisabled(editing))

    clearCache(index)
  }

  const handleApplyEditScore = (
    name: RedisResponseBuffer,
    score: string = '',
  ) => {
    const data: AddMembersToZSetDto = {
      keyName: key,
      members: [
        {
          name,
          score: toNumber(score),
        },
      ],
    }
    dispatch(updateZSetMembers(data, () => handleEditMember(name, false)))
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
        keyType: KeyTypes.ZSet,
      },
    })
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    const fieldColumn = search.find((column) => column.id === 'name')
    if (!fieldColumn) {
      return
    }

    const { value: match } = fieldColumn
    const onSuccess = (data: SearchZSetMembersResponse) => {
      const matchValue = getMatchType(match)
      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          viewType,
          TelemetryEvent.BROWSER_KEY_VALUE_FILTERED,
          TelemetryEvent.TREE_VIEW_KEY_VALUE_FILTERED,
        ),
        eventData: {
          databaseId: instanceId,
          keyType: KeyTypes.ZSet,
          match: matchValue,
          length: data.total,
        },
      })
    }
    setMatch(match)
    if (match === '') {
      dispatch(fetchZSetMembers(key, 0, SCAN_COUNT_DEFAULT, sortedColumnOrder))
      return
    }
    dispatch(
      fetchSearchZSetMembers(key, 0, SCAN_COUNT_DEFAULT, match, onSuccess),
    )
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
        keyType: KeyTypes.ZSet,
        databaseId: instanceId,
        largestCellLength: members[rowIndex]?.name?.length || 0,
      },
    })

    cellCache.clearAll()
  }

  const onColResizeEnd = (sizes: RelativeWidthSizes) => {
    dispatch(
      updateKeyDetailsSizes({
        type: KeyTypes.ZSet,
        sizes,
      }),
    )
  }

  const columns: ITableColumn[] = [
    {
      id: 'name',
      label: 'Member',
      isSearchable: true,
      prependSearchName: 'Member:',
      initialSearchValue: '',
      truncateText: true,
      isResizable: true,
      minWidth: 140,
      relativeWidth: ZSetSizes?.name || 60,
      alignment: TableCellAlignment.Left,
      className: 'value-table-separate-border',
      headerClassName: 'value-table-separate-border',
      render: function Name(
        _name: string,
        { name: nameItem }: IZsetMember,
        expanded?: boolean,
      ) {
        const { value: decompressedNameItem } = decompressingBuffer(
          nameItem,
          compressor,
        )
        const name = bufferToString(nameItem)
        const { value, isValid } = formattingBuffer(
          decompressedNameItem,
          viewFormat,
          { expanded },
        )
        const tooltipContent = createTooltipContent(
          value,
          decompressedNameItem,
          viewFormat,
        )

        return (
          <Text
            color="secondary"
            component="div"
            style={{ maxWidth: '100%', whiteSpace: 'break-spaces' }}
          >
            <div
              style={{ display: 'flex' }}
              data-testid={`zset-member-value-${name}`}
            >
              <FormattedValue
                value={value}
                expanded={expanded}
                title={
                  isValid
                    ? 'Member'
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
      id: 'score',
      label: 'Score',
      minWidth: 154,
      isSortable: true,
      truncateText: true,
      className: 'noPadding',
      render: function Score(
        _name: string,
        { name: nameItem, score, editing }: IZsetMember,
        expanded?: boolean,
        rowIndex?: number,
      ) {
        const cellContent = score.toString().substring(0, 200)
        const tooltipContent = formatLongName(score.toString())
        const isTruncatedValue = isTruncatedString(nameItem)
        const isEditable = isNumber(score) && !isTruncatedValue
        const editToolTipContent = !isNumber(score)
          ? 'Use CLI or Workbench to edit the score'
          : TEXT_DISABLED_ACTION_WITH_TRUNCATED_DATA

        return (
          <EditableInput
            initialValue={score.toString()}
            placeholder="Enter Score"
            field={rowIndex?.toString()}
            editToolTipContent={!isEditable ? editToolTipContent : null}
            isEditing={editing}
            isEditDisabled={updateLoading || !isEditable}
            onEdit={(value: boolean) =>
              handleEditMember(nameItem, value, rowIndex)
            }
            onDecline={() => handleEditMember(nameItem, false, rowIndex)}
            onApply={(value) => handleApplyEditScore(nameItem, value)}
            validation={validateScoreNumber}
            testIdPrefix="zset"
          >
            <div className="innerCellAsCell">
              {!expanded && (
                <RiTooltip
                  title="Score"
                  anchorClassName="truncateText"
                  position="bottom"
                  content={tooltipContent}
                >
                  <>{cellContent}</>
                </RiTooltip>
              )}
              {expanded && score}
            </div>
          </EditableInput>
        )
      },
    },
    {
      id: 'actions',
      label: '',
      headerClassName: 'value-table-header-actions',
      className: 'actions singleAction',
      minWidth: 40,
      maxWidth: 40,
      absoluteWidth: 40,
      render: function Actions(_act: any, { name: nameItem }: IZsetMember) {
        const name = bufferToString(nameItem, viewFormat)
        return (
          <StopPropagation>
            <S.ValueTableActions>
              <PopoverDelete
                header={createDeleteFieldHeader(nameItem)}
                text={createDeleteFieldMessage(key ?? '')}
                item={name}
                itemRaw={nameItem}
                suffix={suffix}
                deleting={deleting}
                closePopover={closePopover}
                updateLoading={false}
                showPopover={showPopover}
                handleDeleteItem={handleDeleteMember}
                handleButtonClick={handleRemoveIconClick}
                testid={`zset-remove-button-${name}`}
                appendInfo={
                  length === 1 ? HelpTexts.REMOVE_LAST_ELEMENT() : null
                }
              />
            </S.ValueTableActions>
          </StopPropagation>
        )
      },
    },
  ]

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)

    dispatch(fetchZSetMembers(key, 0, SCAN_COUNT_DEFAULT, order))
  }

  const loadMoreItems = ({ startIndex, stopIndex }: any) => {
    if (!searching) {
      dispatch(
        fetchMoreZSetMembers(
          key,
          startIndex,
          stopIndex - startIndex + 1,
          sortedColumnOrder,
        ),
      )
      return
    }
    if (nextCursor !== 0) {
      dispatch(
        fetchSearchMoreZSetMembers(key, nextCursor, SCAN_COUNT_DEFAULT, match),
      )
    }
  }

  const sortedColumn = {
    column: sortedColumnName,
    order: sortedColumnOrder,
  }

  return (
    <S.Container
      data-testid="zset-details"
      className="key-details-table hash-fields-container"
    >
      <VirtualTable
        autoHeight
        tableRef={tableRef}
        expandable
        keyName={key}
        headerHeight={headerHeight}
        rowHeight={rowHeight}
        onChangeWidth={setWidth}
        columns={columns.map((column, i, arr) => ({
          ...column,
          width: getColumnWidth(i, width, arr),
        }))}
        footerHeight={0}
        loadMoreItems={loadMoreItems}
        loading={loading}
        searching={searching}
        items={members}
        sortedColumn={sortedColumn}
        onChangeSorting={onChangeSorting}
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
    </S.Container>
  )
}

export { ZSetDetailsTable }
