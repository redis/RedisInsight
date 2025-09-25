import React, { useState, useMemo, useEffect } from 'react'

import { Title } from 'uiSrc/components/base/text'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { Loader } from 'uiSrc/components/base/display'

import { CancelSlimIcon } from 'uiSrc/components/base/icons'
import { VectorSearchSavedQueriesContentWrapper } from './styles'
import { SavedIndex } from './types'
import {
  VectorSearchScreenHeader,
  VectorSearchScreenSideBarWrapper,
  VectorSearchScreenWrapper,
} from '../styles'
import { useTelemetryMountEvent } from '../hooks/useTelemetryMountEvent'
import { TelemetryEvent } from 'uiSrc/telemetry'
import { useRedisearchListData } from '../useRedisearchListData'
import { collectChangedSavedQueryIndexTelemetry } from '../telemetry'
import { PresetDataType } from '../create-index/types'
import NoDataMessage from '../components/no-data-message/NoDataMessage'
import { QueryCard } from './QueryCard'
import { IndexSelect } from './IndexSelect'
import { NoDataMessageKeys } from '../components/no-data-message/data'
import { savedQueries } from './saved-queries'

const mockSavedIndexes: SavedIndex[] = [
  {
    value: PresetDataType.BIKES,
    tags: [FieldTypes.TAG, FieldTypes.TEXT, FieldTypes.VECTOR],
    queries: savedQueries[PresetDataType.BIKES],
  },
  {
    value: PresetDataType.MOVIES,
    tags: [FieldTypes.TAG, FieldTypes.TEXT, FieldTypes.VECTOR],
    queries: savedQueries[PresetDataType.MOVIES],
  },
]

type SavedQueriesScreenProps = {
  instanceId: string
  defaultSavedQueriesIndex?: string
  onQueryInsert: (value: string) => void
  onClose: () => void
}

export const SavedQueriesScreen = ({
  instanceId,
  defaultSavedQueriesIndex,
  onQueryInsert,
  onClose,
}: SavedQueriesScreenProps) => {
  useTelemetryMountEvent(
    TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_OPENED,
    TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_CLOSED,
  )
  const [selectedIndex, setSelectedIndex] = useState(defaultSavedQueriesIndex)
  const { stringData, loading } = useRedisearchListData()
  const savedIndexes = useMemo(
    () =>
      stringData.map(
        (index) =>
          ({
            value: index,
            // Hardcoded values for the preset index, else empty arrays:
            tags: mockSavedIndexes.find((i) => i.value === index)?.tags || [],
            queries:
              mockSavedIndexes.find((i) => i.value === index)?.queries || [],
          }) as SavedIndex,
      ),
    [stringData],
  )
  const selectedIndexItem = savedIndexes.find(
    (index) => index.value === selectedIndex,
  )
  const hasIndexes = savedIndexes.length > 0

  useEffect(() => {
    if (selectedIndex) return

    // Select the first index by default if none is selected yet
    const firstIndex = savedIndexes[0]?.value

    firstIndex && setSelectedIndex(firstIndex)
  }, [selectedIndex, savedIndexes])

  const onIndexChange = (value: string) => {
    setSelectedIndex(value)

    collectChangedSavedQueryIndexTelemetry({
      instanceId,
    })
  }

  return (
    <VectorSearchScreenWrapper
      direction="column"
      data-testid="saved-queries-screen"
    >
      <VectorSearchScreenHeader padding={6}>
        <Title size="S" data-testid="title">
          Saved queries
        </Title>
        <IconButton
          size="XS"
          icon={CancelSlimIcon}
          aria-label="Close"
          data-testid={'close-saved-queries-btn'}
          onClick={() => onClose()}
        />
      </VectorSearchScreenHeader>
      <VectorSearchScreenSideBarWrapper grow={1} padding={6}>
        <VectorSearchSavedQueriesContentWrapper>
          {loading && <Loader data-testid="manage-indexes-list--loader" />}

          {!loading && hasIndexes && (
            <IndexSelect
              savedIndexes={savedIndexes}
              selectedIndex={selectedIndexItem?.value}
              onIndexChange={onIndexChange}
            />
          )}

          {!loading && !hasIndexes && (
            <NoDataMessage variant={NoDataMessageKeys.SavedQueries} />
          )}

          {selectedIndexItem?.queries.map((query) => (
            <QueryCard
              key={query.value}
              label={query.label}
              value={query.value}
              onQueryInsert={onQueryInsert}
            />
          ))}
        </VectorSearchSavedQueriesContentWrapper>
      </VectorSearchScreenSideBarWrapper>
    </VectorSearchScreenWrapper>
  )
}
