import React from 'react'

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

type SavedQueriesScreenProps = {
  savedIndexes: SavedIndex[]
  selectedIndex?: SavedIndex
  onIndexChange: (value: string) => void
  onQueryInsert: (value: string) => void
  onClose: () => void
}

export const SavedQueriesScreen = ({
  savedIndexes,
  selectedIndex,
  onIndexChange,
  onQueryInsert,
  onClose,
}: SavedQueriesScreenProps) => {
  useTelemetryMountEvent(
    TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_OPENED,
    TelemetryEvent.SEARCH_SAVED_QUERIES_PANEL_CLOSED,
  )

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
          <VectorSearchSavedQueriesSelectWrapper>
            <Title size="S">Index:</Title>
            <RiSelect
              loading={false}
              disabled={false}
              options={savedIndexes}
              value={selectedIndex?.value}
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
          {selectedIndex?.queries.map((query) => (
            <VectorSearchScreenBlockWrapper
              key={query.value}
              // as="div"
              padding={6}
            >
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
