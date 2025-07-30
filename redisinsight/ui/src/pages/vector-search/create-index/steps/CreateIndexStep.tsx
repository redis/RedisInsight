import React from 'react'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import CreateIndexStepWrapper from 'uiSrc/components/new-index/create-index-step'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { SearchInput } from 'uiSrc/components/base/inputs'
import { VectorSearchBox } from 'uiSrc/components/new-index/create-index-step/field-box/types'
import { FieldBoxesGroup } from 'uiSrc/components/new-index/create-index-step/field-boxes-group/FieldBoxesGroup'

import { CreateIndexStepScreenWrapper, SearchInputWrapper } from './styles'
import { IStepComponent } from '../types'

interface RedisIndexField {
  name: string
  type: FieldTypes
  description?: string
}

const BIKES_INDEX_FIELDS: RedisIndexField[] = [
  {
    name: 'id',
    type: FieldTypes.TAG,
    description: 'Unique product identifier',
  },
  {
    name: 'description',
    type: FieldTypes.TEXT,
    description: 'Product description',
  },
  {
    name: 'price',
    type: FieldTypes.NUMERIC,
    description: 'Product price',
  },
  {
    name: 'price_1',
    type: FieldTypes.NUMERIC,
    description: 'Product price',
  },
  {
    name: 'name',
    type: FieldTypes.TEXT,
    description: 'Product name',
  },
  { name: 'category', type: FieldTypes.TAG, description: 'Product category' },
  {
    name: 'embedding',
    type: FieldTypes.VECTOR,
    description: 'Product embedding vector',
  },
  {
    name: 'embedding_1',
    type: FieldTypes.VECTOR,
    description: 'Product embedding vector',
  },
]

const boxes: VectorSearchBox[] = BIKES_INDEX_FIELDS.map((field) => ({
  value: field.name,
  label: field.name,
  text: field.description ?? '',
  tag: field.type,
  disabled: true,
}))

const selectedBoXValues = BIKES_INDEX_FIELDS.map((field) => field.name)

export const CreateIndexStep: IStepComponent = ({ setParameters }) => (
  <CreateIndexStepScreenWrapper>
    <FlexItem direction="column" $gap="xxl">
      <FlexItem direction="column" $gap="m">
        <Text>Vector index</Text>
        <Text size="S" color="secondary">
          Indexes tell Redis how to search your data. Creating an index enables
          fast, accurate retrieval across your dataset.
        </Text>
      </FlexItem>
      <CreateIndexStepWrapper />
      <SearchInputWrapper>
        <FlexItem direction="column" $gap="s" grow={1}>
          <Text>Index name</Text>
          <SearchInput
            disabled
            placeholder="Search for index"
            autoComplete="off"
            value="Bikes" // hardcoded for now
            onChange={() => {}}
            data-testid="search-for-index"
          />
        </FlexItem>
      </SearchInputWrapper>
      <FieldBoxesGroup
        boxes={boxes}
        value={selectedBoXValues}
        onChange={() => {}}
      />
    </FlexItem>
  </CreateIndexStepScreenWrapper>
)
