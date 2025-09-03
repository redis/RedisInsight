import { BoxSelectionOption } from 'uiSrc/components/new-index/selection-box/SelectionBox'
import {
  BikeIcon,
  PopcornIcon,
  VectorSearchIcon,
  WandIcon,
} from 'uiSrc/components/base/icons'

import { SearchIndexType, SampleDataType, SampleDataContent } from '../types'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { Row } from 'uiSrc/components/base/layout/flex'
import React from 'react'

// ** Add data step */

export const indexType: BoxSelectionOption<SearchIndexType>[] = [
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

export const sampleDatasetOptions = [
  {
    id: SampleDataType.PRESET_DATA,
    value: SampleDataType.PRESET_DATA,
    label: 'Pre-set data',
  },
  {
    id: SampleDataType.CUSTOM_DATA,
    value: SampleDataType.CUSTOM_DATA,
    label: (
      <Row gap="m">
        Custom data <RiBadge label="Coming soon" />
      </Row>
    ),
    disabled: true,
  },
]

export const indexDataContent: BoxSelectionOption<SampleDataContent>[] = [
  {
    value: SampleDataContent.E_COMMERCE_DISCOVERY,
    label: 'E-commerce Discovery',
    text: 'Find products by meaning, not just keywords.',
    icon: BikeIcon,
  },
  {
    value: SampleDataContent.CONTENT_RECOMMENDATIONS,
    label: 'Movie Recommendations',
    text: 'Suggest movies based on the true meaning of plots or themes.',
    icon: PopcornIcon,
  },
]
