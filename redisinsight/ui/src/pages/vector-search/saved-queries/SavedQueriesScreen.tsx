import React from 'react'

import { Title, Text } from 'uiSrc/components/base/text'

import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { Button } from 'uiSrc/components/base/forms/buttons'
import { FieldTag } from 'uiSrc/components/new-index/create-index-step/field-box/FieldTag'

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

type SavedQueriesScreenProps = {
  savedIndexes: SavedIndex[]
  selectedIndex?: SavedIndex
  onIndexChange: (value: string) => void
  onQueryInsert: (value: string) => void
}

export const SavedQueriesScreen = ({
  savedIndexes,
  selectedIndex,
  onIndexChange,
  onQueryInsert,
}: SavedQueriesScreenProps) => (
  <VectorSearchScreenWrapper direction="column">
    <VectorSearchScreenHeader>
      <Title size="M" data-testid="title">
        Saved queries
      </Title>
    </VectorSearchScreenHeader>
    <VectorSearchScreenFooter grow={1}>
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
          <VectorSearchScreenBlockWrapper key={query.value} as="div">
            <Text>{query.label}</Text>
            <RightAlignedWrapper>
              <Button
                variant="secondary-invert"
                onClick={() => onQueryInsert(query.value)}
              >
                ► Insert
              </Button>
            </RightAlignedWrapper>
          </VectorSearchScreenBlockWrapper>
        ))}
      </VectorSearchSavedQueriesContentWrapper>
    </VectorSearchScreenFooter>
  </VectorSearchScreenWrapper>
)
