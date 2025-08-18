import React from 'react'

import { FieldTag } from 'uiSrc/components/new-index/create-index-step/field-box/FieldTag'

import { RiText, RiTitle } from 'uiBase/text'
import { RiSecondaryButton, RiSelect } from 'uiBase/forms'
import { PlayFilledIcon } from 'uiBase/icons'

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
  <VectorSearchScreenWrapper
    direction="column"
    data-testid="saved-queries-screen"
  >
    <VectorSearchScreenHeader>
      <RiTitle size="M" data-testid="title">
        Saved queries
      </RiTitle>
    </VectorSearchScreenHeader>
    <VectorSearchScreenFooter grow={1}>
      <VectorSearchSavedQueriesContentWrapper>
        <VectorSearchSavedQueriesSelectWrapper>
          <RiTitle size="S">Index:</RiTitle>
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
            <RiText>{query.label}</RiText>
            <RightAlignedWrapper>
              <RiSecondaryButton
                inverted
                icon={PlayFilledIcon}
                size="s"
                onClick={() => onQueryInsert(query.value)}
                data-testid="btn-insert-query"
              >
                Insert
              </RiSecondaryButton>
            </RightAlignedWrapper>
          </VectorSearchScreenBlockWrapper>
        ))}
      </VectorSearchSavedQueriesContentWrapper>
    </VectorSearchScreenFooter>
  </VectorSearchScreenWrapper>
)
