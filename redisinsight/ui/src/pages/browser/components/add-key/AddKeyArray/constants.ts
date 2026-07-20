import { CreateArrayWithExpireDto } from 'apiClient'

import type { PopulateOption } from './AddKeyArray.types'

export type ArrayCreationMode = CreateArrayWithExpireDto['mode']

export const CONTIGUOUS_MODE: ArrayCreationMode = 'contiguous'
export const SPARSE_MODE: ArrayCreationMode = 'sparse'

export const CREATION_MODE_OPTIONS = [
  {
    value: CONTIGUOUS_MODE,
    inputDisplay: 'Contiguous (sequential indexes)',
    label: 'Contiguous (sequential indexes)',
  },
  {
    value: SPARSE_MODE,
    inputDisplay: 'Sparse (explicit indexes)',
    label: 'Sparse (explicit indexes)',
  },
]

export const DEFAULT_START_INDEX = '0'

export enum ArrayCreationSource {
  Scratch = 'scratch',
  SampleDataset = 'sample_dataset',
}

export enum PopulateMode {
  Sample = 'sample',
  Manual = 'manual',
}

export const POPULATE_OPTIONS: PopulateOption[] = [
  {
    value: PopulateMode.Sample,
    label: 'Load sample data',
    description: 'Explore arrays with one of the bundled sample datasets.',
    id: 'populate-sample',
  },
  {
    value: PopulateMode.Manual,
    label: 'Create manually',
    description: 'Define your own key, indexes, and values from scratch.',
    id: 'populate-manual',
  },
]

export const POPULATE_LABEL = 'How would you like to populate this array?'
