import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { VectorSearchBox } from 'uiSrc/components/new-index/create-index-step/field-box/types'
import { BoxSelectionOption } from 'uiSrc/components/new-index/selection-box/SelectionBox'
import {
  BikeIcon,
  PopcornIcon,
  VectorSearchIcon,
  WandIcon,
} from 'uiSrc/components/base/icons'

import { SearchIndexType, SampleDataType, SampleDataContent } from '../types'

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
    label: 'Custom data',
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
    disabled: true,
  },
]

// ** Create index step */

export const bikesIndexFieldsBoxes: VectorSearchBox[] = [
  {
    value: 'id',
    label: 'id',
    text: 'Unique product identifier',
    tag: FieldTypes.TAG,
    disabled: true,
  },
  {
    value: 'description',
    label: 'description',
    text: 'Product description',
    tag: FieldTypes.TEXT,
    disabled: true,
  },
  {
    value: 'price',
    label: 'price',
    text: 'Product price',
    tag: FieldTypes.NUMERIC,
    disabled: true,
  },
  {
    value: 'price_1',
    label: 'price_1',
    text: 'Product price',
    tag: FieldTypes.NUMERIC,
    disabled: true,
  },
  {
    value: 'name',
    label: 'name',
    text: 'Product name',
    tag: FieldTypes.TEXT,
    disabled: true,
  },
  {
    value: 'category',
    label: 'category',
    text: 'Product category',
    tag: FieldTypes.TAG,
    disabled: true,
  },
  {
    value: 'embedding',
    label: 'embedding',
    text: 'Product embedding vector',
    tag: FieldTypes.VECTOR,
    disabled: true,
  },
  {
    value: 'embedding_1',
    label: 'embedding_1',
    text: 'Product embedding vector',
    tag: FieldTypes.VECTOR,
    disabled: true,
  },
]

export const selectedBikesIndexFields = bikesIndexFieldsBoxes.map(
  (field) => field.value,
)
