import React from 'react'

import { RiSelect } from 'uiSrc/components/base/forms/select/RiSelect'
import { FieldTag } from 'uiSrc/components/new-index/create-index-step/field-box/FieldTag'
import { Title } from '../manage-indexes/styles'
import { VectorSearchSavedQueriesSelectWrapper, TagsWrapper } from './styles'
import { SavedIndex } from './types'

type IndexSelectProps = {
  savedIndexes: SavedIndex[]
  selectedIndex?: string
  onIndexChange: (value: string) => void
}

export const IndexSelect = ({
  savedIndexes,
  selectedIndex,
  onIndexChange,
}: IndexSelectProps) => (
  <VectorSearchSavedQueriesSelectWrapper>
    <Title size="S">Index:</Title>
    <RiSelect
      loading={false}
      disabled={false}
      options={savedIndexes}
      value={selectedIndex}
      data-testid="select-saved-index"
      onChange={onIndexChange}
      valueRender={({ option, isOptionValue }) =>
        isOptionValue ? (
          option.value
        ) : (
          <TagsWrapper>
            {option.value}
            {option.tags.map((tag) => (
              <FieldTag key={tag} tag={tag} />
            ))}
          </TagsWrapper>
        )
      }
    />
  </VectorSearchSavedQueriesSelectWrapper>
)
