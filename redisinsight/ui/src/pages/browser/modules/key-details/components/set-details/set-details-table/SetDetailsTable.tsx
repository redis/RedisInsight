import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import cx from 'classnames'
import { CellMeasurerCache } from 'react-virtualized'

import { Text } from 'uiSrc/components/base/text'
import { RedisResponseBuffer, RedisString } from 'uiSrc/slices/interfaces'

import {
  bufferToString,
  createDeleteFieldHeader,
  createDeleteFieldMessage,
  createTooltipContent,
  formattingBuffer,
} from 'uiSrc/utils'
import {
  KeyTypes,
  OVER_RENDER_BUFFER_COUNT,
  TEXT_FAILED_CONVENT_FORMATTER,
} from 'uiSrc/constants'
import {
  sendEventTelemetry,
  TelemetryEvent,
  getBasedOnViewTypeEvent,
  getMatchType,
} from 'uiSrc/telemetry'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import {
  selectedKeyDataSelector,
  keysSelector,
  selectedKeySelector,
} from 'uiSrc/slices/browser/keys'
import {
  deleteSetMembers,
  fetchSetMembers,
  fetchMoreSetMembers,
  setDataSelector,
  setSelector,
} from 'uiSrc/slices/browser/set'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import HelpTexts from 'uiSrc/constants/help-texts'
import { NoResultsFoundText } from 'uiSrc/constants/texts'
import VirtualTable from 'uiSrc/components/virtual-table'
import PopoverDelete from 'uiSrc/pages/browser/components/popover-delete/PopoverDelete'
import { getColumnWidth } from 'uiSrc/components/virtual-grid'
import {
  IColumnSearchState,
  ITableColumn,
} from 'uiSrc/components/virtual-table/interfaces'
import { decompressingBuffer } from 'uiSrc/utils/decompressors'
import { FormattedValue } from 'uiSrc/pages/browser/modules/key-details/shared'
import { GetSetMembersResponse } from 'apiSrc/modules/browser/set/dto'
import styles from './styles.module.scss'

const suffix = '_set'
const headerHeight = 60
const rowHeight = 43
const footerHeight = 0
const matchAllValue = '*'

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: rowHeight,
})

export interface Props {
  onRemoveKey: () => void
}

const SetDetailsTable = (props: Props) => {
  const { onRemoveKey } = props

  const { loading } = useSelector(setSelector)
  const {
    members: loadedMembers,
    total,
    nextCursor,
  } = useSelector(setDataSelector)
  const { length = 0, name: key } = useSelector(selectedKeyDataSelector) ?? {}
  const { id: instanceId, compressor = null } = useSelector(
    connectedInstanceSelector,
  )
  const { viewType } = useSelector(keysSelector)
  const { viewFormat: viewFormatProp } = useSelector(selectedKeySelector)

  const [match, setMatch] = useState('*')
  const [deleting, setDeleting] = useState('')
  const [width, setWidth] = useState(100)
  const [expandedRows, setExpandedRows] = useState<number[]>([])
  const [members, setMembers] = useState<any[]>(loadedMembers)
  const [viewFormat, setViewFormat] = useState(viewFormatProp)

  const formattedLastIndexRef = useRef(OVER_RENDER_BUFFER_COUNT)

  const dispatch = useDispatch()

  useEffect(() => {
    setMembers(loadedMembers)

    if (loadedMembers.length < members.length) {
      formattedLastIndexRef.current = 0
    }

    if (viewFormat !== viewFormatProp) {
      setExpandedRows([])
      setViewFormat(viewFormatProp)

      cellCache.clearAll()
      setTimeout(() => {
        cellCache.clearAll()
      }, 0)
    }
  }, [loadedMembers, viewFormatProp])

  const closePopover = () => {
    setDeleting('')
  }

  const showPopover = (member = '') => {
    setDeleting(`${member + suffix}`)
  }

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
        keyType: KeyTypes.Set,
        numberOfRemoved: 1,
      },
    })
  }

  const handleDeleteMember = (member: string | RedisString = '') => {
    dispatch(deleteSetMembers(key, [member], onSuccessRemoved))
    closePopover()
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
        keyType: KeyTypes.Set,
      },
    })
  }

  const handleSearch = (search: IColumnSearchState[]) => {
    const fieldColumn = search.find((column) => column.id === 'name')
    if (!fieldColumn) {
      return
    }

    const { value: match } = fieldColumn
    const onSuccess = (data: GetSetMembersResponse) => {
      const matchValue = getMatchType(match)
      sendEventTelemetry({
        event: getBasedOnViewTypeEvent(
          viewType,
          TelemetryEvent.BROWSER_KEY_VALUE_FILTERED,
          TelemetryEvent.TREE_VIEW_KEY_VALUE_FILTERED,
        ),
        eventData: {
          databaseId: instanceId,
          keyType: KeyTypes.Set,
          match: matchValue,
          length: data.total,
        },
      })
    }
    setMatch(match)
    dispatch(
      fetchSetMembers(
        key,
        0,
        SCAN_COUNT_DEFAULT,
        match || matchAllValue,
        true,
        onSuccess,
      ),
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
        keyType: KeyTypes.Set,
        databaseId: instanceId,
        largestCellLength: members[rowIndex]?.length || 0,
      },
    })

    cellCache.clearAll()
  }

  const columns: ITableColumn[] = [
    {
      id: 'name',
      label: 'Member',
      isSearchable: true,
      staySearchAlwaysOpen: true,
      initialSearchValue: '',
      truncateText: true,
      render: function Name(
        _name: string,
        memberItem: RedisResponseBuffer,
        expanded: boolean = false,
      ) {
        const { value: decompressedMemberItem } = decompressingBuffer(
          memberItem,
          compressor,
        )
        const { value, isValid } = formattingBuffer(
          decompressedMemberItem,
          viewFormatProp,
          { expanded },
        )
        const tooltipContent = createTooltipContent(
          value,
          decompressedMemberItem,
          viewFormatProp,
        )
        const cellContent = value?.substring?.(0, 200) ?? value

        return (
          <Text
            color="secondary"
            component="div"
            style={{ maxWidth: '100%', whiteSpace: 'break-spaces' }}
          >
            <div
              style={{ display: 'flex' }}
              data-testid={`set-member-value-${cellContent}`}
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
                position="left"
              />
            </div>
          </Text>
        )
      },
    },
    {
      id: 'actions',
      label: '',
      relativeWidth: 60,
      minWidth: 60,
      maxWidth: 60,
      headerClassName: 'hidden',
      render: function Actions(_act: any, memberItem: RedisResponseBuffer) {
        const member = bufferToString(memberItem, viewFormat)
        return (
          <div className="value-table-actions">
            <PopoverDelete
              header={createDeleteFieldHeader(memberItem)}
              text={createDeleteFieldMessage(key ?? '')}
              item={member}
              itemRaw={memberItem}
              suffix={suffix}
              deleting={deleting}
              closePopover={closePopover}
              updateLoading={false}
              showPopover={showPopover}
              handleDeleteItem={handleDeleteMember}
              handleButtonClick={handleRemoveIconClick}
              testid={`set-remove-btn-${member}`}
              appendInfo={
                length === 1 ? HelpTexts.REMOVE_LAST_ELEMENT : null
              }
            />
          </div>
        )
      },
    },
  ]

  const loadMoreItems = () => {
    if (nextCursor !== 0) {
      dispatch(
        fetchMoreSetMembers(
          key,
          nextCursor,
          SCAN_COUNT_DEFAULT,
          match || matchAllValue,
        ),
      )
    }
  }

  return (
    <div
      data-testid="set-details"
      className={cx(
        'key-details-table',
        'set-members-container',
        styles.container,
      )}
    >
      <VirtualTable
        autoHeight
        hideProgress
        expandable
        selectable={false}
        keyName={key}
        headerHeight={headerHeight}
        rowHeight={rowHeight}
        footerHeight={footerHeight}
        loadMoreItems={loadMoreItems}
        loading={loading}
        items={members}
        totalItemsCount={total}
        noItemsMessage={NoResultsFoundText}
        onWheel={closePopover}
        onSearch={handleSearch}
        columns={columns.map((column, i, arr) => ({
          ...column,
          width: getColumnWidth(i, width, arr),
        }))}
        onChangeWidth={setWidth}
        cellCache={cellCache}
        onRowToggleViewClick={handleRowToggleViewClick}
        expandedRows={expandedRows}
        setExpandedRows={setExpandedRows}
      />
    </div>
  )
}

export { SetDetailsTable }
