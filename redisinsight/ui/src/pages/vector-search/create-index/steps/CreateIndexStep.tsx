import React from 'react'

import { EuiFieldText } from '@elastic/eui'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import CreateIndexStepWrapper from 'uiSrc/components/new-index/create-index-step'
import { FieldBoxesGroup } from 'uiSrc/components/new-index/create-index-step/field-boxes-group/FieldBoxesGroup'
import { VectorSearchBox } from 'uiSrc/components/new-index/create-index-step/field-box/types'

import { bikesIndexFieldsBoxes } from './config'
import { CreateIndexStepScreenWrapper, SearchInputWrapper } from './styles'
import { IStepComponent, StepComponentProps } from '../types'

// eslint-disable-next-line arrow-body-style, @typescript-eslint/no-unused-vars
const useIndexFieldsBoxes = (_indexName: string): VectorSearchBox[] => {
  return bikesIndexFieldsBoxes
}

export const CreateIndexStep: IStepComponent = ({
  parameters,
  setParameters,
}: StepComponentProps) => {
  const boxes = useIndexFieldsBoxes(parameters.indexName)

  return (
    <CreateIndexStepScreenWrapper>
      <FlexItem direction="column" $gap="xxl">
        <FlexItem direction="column" $gap="m">
          <Text>Vector index</Text>
          <Text size="S" color="secondary">
            Indexes tell Redis how to search your data. Creating an index
            enables fast, accurate retrieval across your dataset.
          </Text>
        </FlexItem>
        <CreateIndexStepWrapper />
        <SearchInputWrapper>
          <FlexItem direction="column" $gap="s" grow={1}>
            <Text>Index name</Text>
            <EuiFieldText
              disabled
              placeholder="Search for index"
              autoComplete="off"
              value={parameters.indexName}
              onChange={(event) =>
                setParameters({ indexName: event.target.value })
              }
              data-testid="search-for-index"
            />
          </FlexItem>
        </SearchInputWrapper>
        <FieldBoxesGroup
          boxes={boxes}
          value={parameters.indexFields}
          onChange={(value) => setParameters({ indexFields: value })}
        />
      </FlexItem>
    </CreateIndexStepScreenWrapper>
  )
}
