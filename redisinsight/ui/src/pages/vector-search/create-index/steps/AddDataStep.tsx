import React from 'react'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { RiRadioGroup } from 'uiSrc/components/base/forms/radio-group/RadioGroup'

import {
  LargeSelectionBox,
  SmallSelectionBox,
  StyledBoxSelectionGroup,
} from './styles'
import {
  useGetIndexDataContent,
  indexType,
  sampleDatasetOptions,
} from './config'
import { IStepComponent, SampleDataType, StepComponentProps } from '../types'

export const AddDataStep: IStepComponent = ({
  parameters,
  setParameters,
}: StepComponentProps) => {
  const indexDataContent = useGetIndexDataContent()

  return (
    <>
      <FlexItem direction="column" $gap="m">
        <StyledBoxSelectionGroup defaultValue={parameters.searchIndexType}>
          {indexType.map((type) => (
            <LargeSelectionBox
              box={type}
              key={type.value}
              onClick={() => setParameters({ searchIndexType: type.value })}
            />
          ))}
        </StyledBoxSelectionGroup>
      </FlexItem>
      <FlexItem direction="column" $gap="m">
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
      <FlexItem direction="column" $gap="m">
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
    </>
  )
}
