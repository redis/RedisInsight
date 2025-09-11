import React from 'react'

import { RadioGroupItem } from '@redis-ui/components'
import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiRadioGroup } from 'uiSrc/components/base/forms/radio-group/RadioGroup'

import {
  LargeSelectionBox,
  SmallSelectionBox,
  StyledBoxSelectionGroup,
} from './styles'
import {
  indexDataContent,
  indexType,
  sampleDatasetOptions,
  selectedBikesIndexFields,
  selectedMoviesIndexFields,
} from './config'
import {
  IStepComponent,
  PresetDataType,
  SampleDataContent,
  SampleDataType,
  StepComponentProps,
} from '../types'

export const AddDataStep: IStepComponent = ({
  parameters,
  setParameters,
}: StepComponentProps) => (
  <FlexGroup direction="column" gap="xxl" data-testid="create-index-step1">
    <FlexItem direction="column" $gap="m">
      <StyledBoxSelectionGroup
        defaultValue={parameters.searchIndexType}
        data-testid="step-data--index-type"
      >
        {indexType.map((type) => (
          <LargeSelectionBox
            box={type}
            key={type.value}
            onClick={() => setParameters({ searchIndexType: type.value })}
          />
        ))}
      </StyledBoxSelectionGroup>
    </FlexItem>
    <FlexItem
      direction="column"
      $gap="m"
      data-testid="step-data--sample-dataset"
    >
      <Text size="L">Select data to use</Text>
      <RiRadioGroup
        items={sampleDatasetOptions as RadioGroupItem[]}
        layout="horizontal"
        defaultValue={parameters.sampleDataType}
        onChange={(id) =>
          setParameters({ sampleDataType: id as SampleDataType })
        }
      />
    </FlexItem>
    <FlexItem direction="column" $gap="m" data-testid="step-data--data-content">
      <Text size="L">Select sample data to load</Text>
      <StyledBoxSelectionGroup defaultValue={parameters.dataContent}>
        {indexDataContent.map((type) => (
          <SmallSelectionBox
            box={type}
            key={type.value}
            onClick={() =>
              setParameters({
                dataContent: type.value,
                indexName:
                  type.value === SampleDataContent.E_COMMERCE_DISCOVERY
                    ? PresetDataType.BIKES
                    : PresetDataType.MOVIES,
                indexFields:
                  type.value === SampleDataContent.E_COMMERCE_DISCOVERY
                    ? selectedBikesIndexFields
                    : selectedMoviesIndexFields,
              })
            }
          />
        ))}
      </StyledBoxSelectionGroup>
    </FlexItem>
  </FlexGroup>
)
