import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { flatMap, isNull } from 'lodash'
import { useParams } from 'react-router-dom'

import {
  fetchStreamEntries,
  streamDataSelector,
  streamSelector,
} from 'uiSrc/slices/browser/stream'
import { ITableColumn } from 'uiSrc/components/virtual-grid/interfaces'
import {
  keysSelector,
  selectedKeyDataSelector,
} from 'uiSrc/slices/browser/keys'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { KeyTypes, SortOrder } from 'uiSrc/constants'
import VirtualGrid from 'uiSrc/components/virtual-grid'
import {
  getBasedOnViewTypeEvent,
  sendEventTelemetry,
  TelemetryEvent,
} from 'uiSrc/telemetry'
import { StreamEntryDto } from 'apiSrc/modules/browser/stream/dto'

import * as S from './StreamDataView.styles'

const headerHeight = 60
const rowHeight = 60
const minColumnWidth = 190
const noItemsMessageInEmptyStream = 'There are no Entries in the Stream.'
const noItemsMessageInRange = 'No results found.'

export interface Props {
  data: StreamEntryDto[]
  columns: ITableColumn[]
  onClosePopover: () => void
  loadMoreItems: () => void
}

const StreamDataView = (props: Props) => {
  const {
    data: entries = [],
    columns = [],
    onClosePopover,
    loadMoreItems,
  } = props
  const dispatch = useDispatch()

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { viewType } = useSelector(keysSelector)
  const { loading } = useSelector(streamSelector)
  const { total, firstEntry, lastEntry } = useSelector(streamDataSelector)
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }

  const [sortedColumnName, setSortedColumnName] = useState<string>('id')
  const [sortedColumnOrder, setSortedColumnOrder] = useState<SortOrder>(
    SortOrder.DESC,
  )

  const onChangeSorting = (column: any, order: SortOrder) => {
    setSortedColumnName(column)
    setSortedColumnOrder(order)

    dispatch(fetchStreamEntries(key, SCAN_COUNT_DEFAULT, order, false))
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
        keyType: KeyTypes.Stream,
        databaseId: instanceId,
        largestCellLength:
          Math.max(
            ...flatMap(entries[rowIndex]?.fields).map(
              (a) => a.toString().length,
            ),
          ) || 0,
      },
    })
  }

  return (
    <>
      <S.Container
        className="key-details-table stream-details-table"
        data-testid="stream-entries-container"
      >
        <VirtualGrid
          hideProgress
          stickLastColumnHeaderCell
          selectable={false}
          keyName={key}
          headerHeight={entries?.length ? headerHeight : 0}
          rowHeight={rowHeight}
          columns={columns}
          footerHeight={0}
          loadMoreItems={loadMoreItems}
          loading={loading}
          items={entries}
          totalItemsCount={total}
          onWheel={onClosePopover}
          onChangeSorting={onChangeSorting}
          noItemsMessage={
            isNull(firstEntry) && isNull(lastEntry)
              ? noItemsMessageInEmptyStream
              : noItemsMessageInRange
          }
          onRowToggleViewClick={handleRowToggleViewClick}
          maxTableWidth={columns.reduce(
            (a, { maxWidth = minColumnWidth }) => a + maxWidth,
            0,
          )}
          sortedColumn={
            entries?.length
              ? {
                  column: sortedColumnName,
                  order: sortedColumnOrder,
                }
              : undefined
          }
        />
      </S.Container>
    </>
  )
}

export default StreamDataView
