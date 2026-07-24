import React, { useMemo } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
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
import Tabs, { TabInfo } from 'uiSrc/components/base/layout/tabs'
import { useTranslation } from 'uiSrc/i18n'
import { ConsumerGroupDto } from 'apiClient'

const StreamTabs = () => {
  const { t } = useTranslation()
  const { viewType } = useAppSelector(streamSelector)
  const { name: key } = useAppSelector(selectedKeyDataSelector) ?? { name: '' }
  const { nameString: selectedGroupName = '' } =
    useAppSelector(selectedGroupSelector) ?? {}
  const { nameString: selectedConsumerName = '' } =
    useAppSelector(selectedConsumerSelector) ?? {}

  const { instanceId } = useParams<{ instanceId: string }>()

  const dispatch = useAppDispatch()

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
        label: t('browser.stream.tabs.data'),
        content: null,
      },
      {
        value: StreamViewType.Groups,
        label: t('browser.stream.tabs.groups'),
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
  }, [viewType, selectedGroupName, selectedConsumerName, t])

  return (
    <Tabs
      tabs={tabs}
      value={viewType}
      onChange={(id) => onSelectedTabChanged(id as StreamViewType)}
      data-testid="stream-tabs"
    />
  )
}

export default StreamTabs
