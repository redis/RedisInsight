// This is because of the long vec value in the data
/* eslint-disable max-len */
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

const mockSavedIndexes: SavedIndex[] = [
  {
    value: PresetDataType.BIKES,
    tags: [FieldTypes.TAG, FieldTypes.TEXT, FieldTypes.VECTOR],
    queries: [
      {
        label: 'Search for "Nord" bikes ordered by price',
        value: 'FT.SEARCH idx:bikes_vss "@brand:Nord" SORTBY price ASC',
      },
      {
        label: 'Find road alloy bikes under 20kg',
        value: 'FT.SEARCH idx:bikes_vss "@material:{alloy} @weight:[0 20]"',
      },
    ],
  },
  {
    value: PresetDataType.MOVIES,
    tags: [FieldTypes.TAG, FieldTypes.TEXT, FieldTypes.VECTOR],
    queries: [
      {
        label: 'I want a fun animated movie about toys and friendship',
        value:
          'FT.SEARCH idx:movies_vss "*=>[KNN 3 @embedding $vec AS score]" ' +
          `PARAMS 2 vec ${String.raw`"\x9a\x99\x19\x3f\xcd\xcc\xcc\x3d\x9a\x99\x4c\x3f\x9a\x99\x33\x3e\x9a\x99\x33\x3f\xcd\xcc\x66\x3e\xcd\xcc\xcc\x3d\xcd\xcc\x4c\x3e"`} ` +
          'SORTBY score ' +
          'RETURN 3 title plot score ' +
          'DIALECT 2',
      },
      {
        label: 'A feel-good film about music and students',
        value:
          'FT.SEARCH idx:movies_vss "@genres:{Music} =>[KNN 5 @embedding $vec AS score]" ' +
          `PARAMS 2 vec ${String.raw`"\x9a\x99\x1d\x3e\xcd\xcc\x4c\xbd\x9a\x99\x99\x3e\x9a\x99\x19\x3e\x9a\x99\x19\xbe\x9a\x99\x1d\x3e\xcd\xcc\x0c\x3e\x9a\x99\xf1\xbc"`} ` +
          'SORTBY score ' +
          'RETURN 3 title genres score ' +
          'DIALECT 2',
      },
      {
        label: 'Find classic musical rebellion films from the 90s',
        value:
          'FT.SEARCH idx:movies_vss "(@genres:{Music} @year:[1970 1979]) =>[KNN 5 @embedding $vec AS score]" ' +
          `PARAMS 2 vec ${String.raw`"\x9a\x99\x1d\x3e\xcd\xcc\x4c\xbd\x9a\x99\x99\x3e\x9a\x99\x19\x3e\x9a\x99\x19\xbe\x9a\x99\x1d\x3e\xcd\xcc\x0c\x3e\x9a\x99\xf1\xbc"`} ` +
          'SORTBY score ' +
          'RETURN 4 title year genres score ' +
          'DIALECT 2',
      },
      {
        label:
          'You like Animated and Sci-Fi movies. Personalize results by filtering the vector search',
        value:
          `FT.SEARCH idx:movies_vss '@genres:{"Animated"|"Sci-Fi"} =>[KNN 5 @embedding $vec AS score]' ` +
          `PARAMS 2 vec ${String.raw`"\x9a\x99\x1d\x3e\xcd\xcc\x4c\xbd\x9a\x99\x99\x3e\x9a\x99\x19\x3e\x9a\x99\x19\xbe\x9a\x99\x1d\x3e\xcd\xcc\x0c\x3e\x9a\x99\xf1\xbc"`} ` +
          'SORTBY score ' +
          'RETURN 3 title genres score ' +
          'DIALECT 2',
      },
    ],
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
