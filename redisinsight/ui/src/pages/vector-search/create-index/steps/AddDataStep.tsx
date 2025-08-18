import React from 'react'

import { RiRadioGroup } from 'uiBase/forms'

import {
  LargeSelectionBox,
  SmallSelectionBox,
  StyledBoxSelectionGroup,
} from './styles'
import { indexDataContent, indexType, sampleDatasetOptions } from './config'
import { IStepComponent, SampleDataType, StepComponentProps } from '../types'
import { RiFlexItem } from 'uiBase/layout'
import { RiText } from 'uiBase/text'

export const AddDataStep: IStepComponent = ({
  parameters,
  setParameters,
}: StepComponentProps) => (
  <>
    <RiFlexItem direction="column" $gap="m">
      <StyledBoxSelectionGroup defaultValue={parameters.searchIndexType}>
        {indexType.map((type) => (
          <LargeSelectionBox
            box={type}
            key={type.value}
            onClick={() => setParameters({ searchIndexType: type.value })}
          />
        ))}
      </StyledBoxSelectionGroup>
    </RiFlexItem>
    <RiFlexItem direction="column" $gap="m">
      <RiText size="L">Select sample dataset</RiText>
      <RiRadioGroup
        items={sampleDatasetOptions}
        layout="horizontal"
        defaultValue={parameters.sampleDataType}
        onChange={(id) =>
          setParameters({ sampleDataType: id as SampleDataType })
        }
      />
    </RiFlexItem>
    <RiFlexItem direction="column" $gap="m">
      <RiText>Data content</RiText>
      <StyledBoxSelectionGroup defaultValue={parameters.dataContent}>
        {indexDataContent.map((type) => (
          <SmallSelectionBox
            box={type}
            key={type.value}
            onClick={() => setParameters({ dataContent: type.value })}
          />
        ))}
      </StyledBoxSelectionGroup>
    </RiFlexItem>
  </>
)
