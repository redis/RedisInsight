import { ParseKeys } from 'i18next'
import { CreateArrayWithExpireDto } from 'apiClient'

import type { PopulateOption } from './AddKeyArray.types'

export type ArrayCreationMode = CreateArrayWithExpireDto['mode']

export const CONTIGUOUS_MODE: ArrayCreationMode = 'contiguous'
export const SPARSE_MODE: ArrayCreationMode = 'sparse'

// inputDisplay/label hold i18n keys, resolved with t() at render time.
export const CREATION_MODE_OPTIONS: {
  value: ArrayCreationMode
  inputDisplay: ParseKeys
  label: ParseKeys
}[] = [
  {
    value: CONTIGUOUS_MODE,
    inputDisplay: 'browser.addKey.array.mode.contiguous',
    label: 'browser.addKey.array.mode.contiguous',
  },
  {
    value: SPARSE_MODE,
    inputDisplay: 'browser.addKey.array.mode.sparse',
    label: 'browser.addKey.array.mode.sparse',
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

// label/description hold i18n keys, resolved with t() at render time.
export const POPULATE_OPTIONS: PopulateOption[] = [
  {
    value: PopulateMode.Sample,
    label: 'browser.addKey.array.populate.sample.label',
    description: 'browser.addKey.array.populate.sample.description',
    id: 'populate-sample',
  },
  {
    value: PopulateMode.Manual,
    label: 'browser.addKey.array.populate.manual.label',
    description: 'browser.addKey.array.populate.manual.description',
    id: 'populate-manual',
  },
]

export const POPULATE_LABEL: ParseKeys = 'browser.addKey.array.populateLabel'
