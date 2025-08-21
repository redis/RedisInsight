import React, { useState, useMemo, useEffect } from 'react'

import { Title, Text } from 'uiSrc/components/base/text'

import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { EmptyButton, IconButton } from 'uiSrc/components/base/forms/buttons'
import { FieldTag } from 'uiSrc/components/new-index/create-index-step/field-box/FieldTag'

import { CancelSlimIcon, PlayFilledIcon } from 'uiSrc/components/base/icons'
import {
  RightAlignedWrapper,
  TagsWrapper,
  VectorSearchSavedQueriesContentWrapper,
  VectorSearchSavedQueriesSelectWrapper,
} from './styles'
import { SavedIndex } from './types'
import {
  VectorSearchScreenBlockWrapper,
  VectorSearchScreenFooter,
  VectorSearchScreenHeader,
  VectorSearchScreenWrapper,
} from '../styles'
import { useTelemetryMountEvent } from '../hooks/useTelemetryMountEvent'
import { TelemetryEvent } from 'uiSrc/telemetry'
import { useRedisearchListData } from '../useRedisearchListData'
import { collectChangedSavedQueryIndexTelemetry } from '../telemetry'
import { PresetDataType } from '../create-index/types'
import { Loader } from '@redis-ui/components'
import NoIndexesMessage from '../manage-indexes/NoIndexesMessage'

const mockSavedIndexes: SavedIndex[] = [
  {
    value: PresetDataType.BIKES,
    tags: ['tag', 'text', 'vector'],
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
]

type SavedQueriesScreenProps = {
  instanceId: string
  onQueryInsert: (value: string) => void
  onClose: () => void
}

export const SavedQueriesScreen = ({
  instanceId,
  onQueryInsert,
  onClose,
}: SavedQueriesScreenProps) => {
  useTelemetryMountEvent(
    TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_OPENED,
    TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_CLOSED,
  )
  const [selectedIndex, setSelectedIndex] = useState('')
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

  useEffect(() => {
    const firstIndex = savedIndexes[0]?.value

    firstIndex && setSelectedIndex(firstIndex)
  }, [savedIndexes])

  const onIndexChange = (value: string) => {
    setSelectedIndex(value)

    collectChangedSavedQueryIndexTelemetry({
      instanceId,
    })
  }

  if (loading) {
    return <Loader data-testid="manage-indexes-list--loader" />
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
      <VectorSearchScreenFooter grow={1} padding={6}>
        <VectorSearchSavedQueriesContentWrapper>
          {savedIndexes.length > 0 ? (
            <VectorSearchSavedQueriesSelectWrapper>
              <Title size="S">Index:</Title>
              <RiSelect
                loading={false}
                disabled={false}
                options={savedIndexes}
                value={selectedIndexItem?.value}
                data-testid="select-saved-index"
                onChange={onIndexChange}
                valueRender={({ option, isOptionValue }) =>
                  isOptionValue ? (
                    option.value
                  ) : (
                    <TagsWrapper>
                      {option.value}
                      {option.tags.map((tag) => (
                        <FieldTag key={tag} tag={tag as any} />
                      ))}
                    </TagsWrapper>
                  )
                }
              />
            </VectorSearchSavedQueriesSelectWrapper>
          ) : (
            <NoIndexesMessage />
          )}
          {selectedIndexItem?.queries.map((query) => (
            <VectorSearchScreenBlockWrapper key={query.value} padding={6}>
              <Text>{query.label}</Text>
              <RightAlignedWrapper>
                <EmptyButton
                  icon={PlayFilledIcon}
                  onClick={() => onQueryInsert(query.value)}
                  data-testid="btn-insert-query"
                >
                  Insert
                </EmptyButton>
              </RightAlignedWrapper>
            </VectorSearchScreenBlockWrapper>
          ))}
        </VectorSearchSavedQueriesContentWrapper>
      </VectorSearchScreenFooter>
    </VectorSearchScreenWrapper>
  )
}
