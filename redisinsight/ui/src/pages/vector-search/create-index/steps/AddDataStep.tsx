import React from 'react'

import { FlexGroup, FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiRadioGroup } from 'uiSrc/components/base/forms/radio-group/RadioGroup'

import {
  LargeSelectionBox,
  SmallSelectionBox,
  StyledBoxSelectionGroup,
} from './styles'
import { indexDataContent, indexType, sampleDatasetOptions } from './config'
import { IStepComponent, SampleDataType, StepComponentProps } from '../types'

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
      <Text size="L">Select sample dataset</Text>
      <RiRadioGroup
        items={sampleDatasetOptions}
        layout="horizontal"
        defaultValue={parameters.sampleDataType}
        onChange={(id) =>
          setParameters({ sampleDataType: id as SampleDataType })
        }
      />
    </FlexItem>
    <FlexItem direction="column" $gap="m" data-testid="step-data--data-content">
      <Text>Data content</Text>
      <StyledBoxSelectionGroup defaultValue={parameters.dataContent}>
        {indexDataContent.map((type) => (
          <SmallSelectionBox
            box={type}
            key={type.value}
            onClick={() => setParameters({ dataContent: type.value })}
          />
        ))}
      </StyledBoxSelectionGroup>
    </FlexItem>
  </FlexGroup>
)
