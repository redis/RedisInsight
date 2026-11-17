import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import { flatMap, isNull } from 'lodash'
import cx from 'classnames'
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
import { useTranslation } from 'uiSrc/i18n'
import { StreamEntryDto } from 'apiClient'

import styles from './styles.module.scss'

const headerHeight = 60
const rowHeight = 60
const minColumnWidth = 190

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
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { instanceId = '' } = useParams<{ instanceId: string }>()
  const { viewType } = useAppSelector(keysSelector)
  const { loading } = useAppSelector(streamSelector)
  const { total, firstEntry, lastEntry } = useAppSelector(streamDataSelector)
  const { name: key } = useAppSelector(selectedKeyDataSelector) ?? { name: '' }

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
      <div
        className={cx(
          'key-details-table',
          'stream-details-table',
          styles.container,
        )}
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
              ? t('browser.stream.data.emptyStream')
              : t('browser.stream.data.noResults')
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
      </div>
    </>
  )
}

export default StreamDataView
