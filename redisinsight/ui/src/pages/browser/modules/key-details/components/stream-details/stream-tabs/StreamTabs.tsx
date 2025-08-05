import React, { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'

import {
  streamSelector,
  setStreamViewType,
  fetchConsumerGroups,
  selectedGroupSelector,
  selectedConsumerSelector,
  fetchStreamEntries,
} from 'uiSrc/slices/browser/stream'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { SCAN_COUNT_DEFAULT } from 'uiSrc/constants/api'
import { SortOrder } from 'uiSrc/constants'
import { selectedKeyDataSelector } from 'uiSrc/slices/browser/keys'
import { RiTabs, TabInfo } from 'uiSrc/components/base/layout'
import { ConsumerGroupDto } from 'apiSrc/modules/browser/stream/dto'

const StreamTabs = () => {
  const { viewType } = useSelector(streamSelector)
  const { name: key } = useSelector(selectedKeyDataSelector) ?? { name: '' }
  const { nameString: selectedGroupName = '' } =
    useSelector(selectedGroupSelector) ?? {}
  const { nameString: selectedConsumerName = '' } =
    useSelector(selectedConsumerSelector) ?? {}

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useDispatch()

  const onSuccessLoadedConsumerGroups = (data: ConsumerGroupDto[]) => {
    sendEventTelemetry({
      event: TelemetryEvent.STREAM_CONSUMER_GROUPS_LOADED,
      eventData: {
        databaseId: instanceId,
        length: data.length,
      },
    })
  }

  const onSelectedTabChanged = (id: StreamViewType) => {
    if (id === StreamViewType.Data) {
      dispatch<any>(
        fetchStreamEntries(key, SCAN_COUNT_DEFAULT, SortOrder.DESC, true),
      )
    }
    if (id === StreamViewType.Groups) {
      dispatch(fetchConsumerGroups(true, onSuccessLoadedConsumerGroups))
    }
    dispatch(setStreamViewType(id))
  }

  const tabs: TabInfo[] = useMemo(() => {
    const baseTabs: TabInfo[] = [
      {
        value: StreamViewType.Data,
        label: 'Stream Data',
        content: null,
      },
      {
        value: StreamViewType.Groups,
        label: 'Consumer Groups',
        content: null,
      },
    ]

    if (
      selectedGroupName &&
      (viewType === StreamViewType.Consumers ||
        viewType === StreamViewType.Messages)
    ) {
      baseTabs.push({
        value: StreamViewType.Consumers,
        label: selectedGroupName,
        content: null,
      })
    }

    if (selectedConsumerName && viewType === StreamViewType.Messages) {
      baseTabs.push({
        value: StreamViewType.Messages,
        label: selectedConsumerName,
        content: null,
      })
    }

    return baseTabs
  }, [viewType, selectedGroupName, selectedConsumerName])

  return (
    <RiTabs
      tabs={tabs}
      value={viewType}
      onChange={(id) => onSelectedTabChanged(id as StreamViewType)}
      data-testid="stream-tabs"
    />
  )
}

export default StreamTabs
