import React from 'react'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'
import { BoxSelectionOption } from 'uiSrc/components/new-index/selection-box/SelectionBox'
import {
  DatabaseIcon,
  UniversityIcon,
  VectorSearchIcon,
  WandIcon,
} from 'uiSrc/components/base/icons'
import { RiRadioGroup } from 'uiSrc/components/base/forms/radio-group/RadioGroup'

import {
  LargeSelectionBox,
  SmallSelectionBox,
  StyledBoxSelectionGroup,
} from './styles'
import {
  IStepComponent,
  SampleDataContent,
  SampleDataType,
  SearchIndexType,
} from '../types'

const indexType: BoxSelectionOption<SearchIndexType>[] = [
  {
    value: SearchIndexType.REDIS_QUERY_ENGINE,
    label: 'Redis Query Engine',
    text: 'For advanced, large-scale search needs',
    icon: VectorSearchIcon,
  },
  {
    value: SearchIndexType.VECTOR_SET,
    label: 'Vector Set',
    text: 'For quick and simple vector use cases',
    icon: WandIcon,
    disabled: true,
  },
]

const sampleDatasetOptions = [
  {
    id: SampleDataType.PRESET_DATA,
    value: SampleDataType.PRESET_DATA,
    label: 'Pre-set data',
  },
  {
    id: SampleDataType.CUSTOM_DATA,
    value: SampleDataType.CUSTOM_DATA,
    label: 'Custom data',
  },
]

const indexDataContent: BoxSelectionOption<SampleDataContent>[] = [
  {
    value: SampleDataContent.E_COMMERCE_DISCOVERY,
    label: 'E-commerce Discovery',
    text: 'Find products by meaning, not just keywords.',
    icon: UniversityIcon, // TODO: bike icon?
  },
  {
    value: SampleDataContent.AI_ASSISTANTS,
    label: 'AI Assistants',
    text: 'Find products by meaning, not just keywords.',
    icon: DatabaseIcon,
  },
  {
    value: SampleDataContent.CONTENT_RECOMMENDATIONS,
    label: 'Content Recommendations',
    text: 'Find products by meaning, not just keywords.',
    icon: UniversityIcon,
    disabled: true,
  },
]

export const AddDataStep: IStepComponent = ({ setParameters }) => (
  <>
    <FlexItem direction="column" $gap="m">
      <StyledBoxSelectionGroup defaultValue={indexType[0].value}>
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
        defaultValue={sampleDatasetOptions[0].value}
        onChange={(id) =>
          setParameters({ sampleDataType: id as SampleDataType })
        }
      />
    </FlexItem>
    <FlexItem direction="column" $gap="m">
      <Text>Data content</Text>
      <StyledBoxSelectionGroup defaultValue={indexDataContent[0].value}>
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
