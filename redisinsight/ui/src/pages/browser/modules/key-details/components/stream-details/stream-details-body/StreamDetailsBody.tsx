import React, { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { isNull, last, toString } from 'lodash'
import cx from 'classnames'

import { RiProgressBarLoader } from 'uiBase/display'
import {
  streamSelector,
  streamGroupsSelector,
  streamRangeSelector,
  streamDataSelector,
  fetchMoreStreamEntries,
  updateStart,
  updateEnd,
  fetchStreamEntries,
  setStreamInitialState,
} from 'uiSrc/slices/browser/stream'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { getNextId, getTimestampFromId } from 'uiSrc/utils/streamUtils'
import { SortOrder } from 'uiSrc/constants'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import RangeFilter from 'uiSrc/components/range-filter'
import { GetStreamEntriesResponse } from 'apiSrc/modules/browser/stream/dto'

import ConsumersViewWrapper from '../consumers-view'
import GroupsViewWrapper from '../groups-view'
import MessagesViewWrapper from '../messages-view'
import StreamDataViewWrapper from '../stream-data-view'
import StreamTabs from '../stream-tabs'
import { MAX_FORMAT_LENGTH_STREAM_TIMESTAMP } from '../constants'

import styles from './styles.module.scss'

export interface Props {}

const StreamDetailsBody = (props: Props) => {
  const {
    viewType,
    loading,
    sortOrder: entryColumnSortOrder,
  } = useSelector(streamSelector)
  const { loading: loadingGroups } = useSelector(streamGroupsSelector)
  const { start, end } = useSelector(streamRangeSelector)
  const { firstEntry, lastEntry, entries } = useSelector(streamDataSelector)
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { id: instanceId } = useSelector(connectedInstanceSelector)

  const dispatch = useDispatch()

  const firstEntryTimeStamp = useMemo(
    () => getTimestampFromId(firstEntry?.id),
    [firstEntry?.id],
  )
  const lastEntryTimeStamp = useMemo(
    () => getTimestampFromId(lastEntry?.id),
    [lastEntry?.id],
  )

  const startNumber = useMemo(
    () => (start === '' ? 0 : parseInt(start, 10)),
    [start],
  )
  const endNumber = useMemo(() => (end === '' ? 0 : parseInt(end, 10)), [end])

  const shouldFilterRender =
    !isNull(firstEntry) &&
    firstEntry.id !== '' &&
    !isNull(lastEntry) &&
    lastEntry.id !== '' &&
    toString(firstEntryTimeStamp)?.length <
      MAX_FORMAT_LENGTH_STREAM_TIMESTAMP &&
    toString(lastEntryTimeStamp)?.length < MAX_FORMAT_LENGTH_STREAM_TIMESTAMP

  useEffect(
    () => () => {
      dispatch(setStreamInitialState())
    },
    [],
  )

  useEffect(() => {
    if (isNull(firstEntry)) {
      dispatch(updateStart(''))
    }
    if (start === '' && firstEntry?.id !== '') {
      dispatch(updateStart(firstEntryTimeStamp.toString()))
    }
  }, [firstEntryTimeStamp])

  useEffect(() => {
    if (isNull(lastEntry)) {
      dispatch(updateEnd(''))
    }
    if (end === '' && lastEntry?.id !== '') {
      dispatch(updateEnd(lastEntryTimeStamp.toString()))
    }
  }, [lastEntryTimeStamp])

  const loadMoreItems = () => {
    const lastLoadedEntryId = last(entries)?.id ?? ''
    const lastLoadedEntryTimeStamp = getTimestampFromId(lastLoadedEntryId)

    const lastRangeEntryTimestamp = end
      ? parseInt(end, 10)
      : getTimestampFromId(lastEntry?.id)
    const firstRangeEntryTimestamp = start
      ? parseInt(start, 10)
      : getTimestampFromId(firstEntry?.id)
    const shouldLoadMore = () => {
      if (!lastLoadedEntryTimeStamp) {
        return false
      }
      return entryColumnSortOrder === SortOrder.ASC
        ? lastLoadedEntryTimeStamp <= lastRangeEntryTimestamp
        : lastLoadedEntryTimeStamp >= firstRangeEntryTimestamp
    }
    const nextId = getNextId(lastLoadedEntryId, entryColumnSortOrder)

    if (shouldLoadMore()) {
      dispatch(
        fetchMoreStreamEntries(
          key,
          entryColumnSortOrder === SortOrder.DESC ? start : nextId,
          entryColumnSortOrder === SortOrder.DESC ? nextId : end,
          SCAN_COUNT_DEFAULT,
          entryColumnSortOrder,
        ),
      )
    }
  }

  const filterTelemetry = (data: GetStreamEntriesResponse) => {
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_DATA_FILTERED,
      eventData: {
        databaseId: instanceId,
        total: data.total,
      },
    })
  }

  const resetFilterTelemetry = (data: GetStreamEntriesResponse) => {
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_DATA_FILTER_RESET,
      eventData: {
        databaseId: instanceId,
        total: data.total,
      },
    })
  }

  const loadEntries = (
    telemetryAction?: (data: GetStreamEntriesResponse) => void,
  ) => {
    dispatch(
      fetchStreamEntries(
        key,
        SCAN_COUNT_DEFAULT,
        entryColumnSortOrder,
        false,
        telemetryAction,
      ),
    )
  }

  const handleChangeStartFilter = useCallback(
    (value: number, shouldSentEventTelemetry: boolean) => {
      dispatch(updateStart(value.toString()))
      loadEntries(shouldSentEventTelemetry ? filterTelemetry : undefined)
    },
    [],
  )

  const handleChangeEndFilter = useCallback(
    (value: number, shouldSentEventTelemetry: boolean) => {
      dispatch(updateEnd(value.toString()))
      loadEntries(shouldSentEventTelemetry ? filterTelemetry : undefined)
    },
    [],
  )

  const handleResetFilter = useCallback(() => {
    dispatch(updateStart(firstEntryTimeStamp.toString()))
    dispatch(updateEnd(lastEntryTimeStamp.toString()))
    loadEntries(resetFilterTelemetry)
  }, [lastEntryTimeStamp, firstEntryTimeStamp])

  const handleUpdateRangeMin = useCallback((min: number) => {
    dispatch(updateStart(min.toString()))
  }, [])

  const handleUpdateRangeMax = useCallback((max: number) => {
    dispatch(updateEnd(max.toString()))
  }, [])

  return (
    <div data-testid="stream-details" className={styles.container}>
      {(loading || loadingGroups) && (
        <RiProgressBarLoader
          color="primary"
          data-testid="progress-key-stream"
        />
      )}
      {shouldFilterRender ? (
        <RangeFilter
          disabled={viewType !== StreamViewType.Data}
          max={lastEntryTimeStamp}
          min={firstEntryTimeStamp}
          start={startNumber}
          end={endNumber}
          handleChangeStart={handleChangeStartFilter}
          handleChangeEnd={handleChangeEndFilter}
          handleResetFilter={handleResetFilter}
          handleUpdateRangeMax={handleUpdateRangeMax}
          handleUpdateRangeMin={handleUpdateRangeMin}
        />
      ) : (
        <div className={styles.rangeWrapper}>
          <div className={cx(styles.sliderTrack, styles.mockRange)} />
        </div>
      )}
      <StreamTabs />
      {viewType === StreamViewType.Data && (
        <StreamDataViewWrapper loadMoreItems={loadMoreItems} {...props} />
      )}
      {viewType === StreamViewType.Groups && <GroupsViewWrapper {...props} />}
      {viewType === StreamViewType.Consumers && (
        <ConsumersViewWrapper {...props} />
      )}
      {viewType === StreamViewType.Messages && (
        <MessagesViewWrapper {...props} />
      )}
    </div>
  )
}

export { StreamDetailsBody }
