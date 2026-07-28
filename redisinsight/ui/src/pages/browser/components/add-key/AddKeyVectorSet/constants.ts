import { ParseKeys } from 'i18next'
import { PopulateOption } from './AddKeyVectorSet.types'

export enum PopulateMode {
  Sample = 'sample',
  Manual = 'manual',
}

// label/description hold i18n keys, resolved with t() at render time.
export const POPULATE_OPTIONS: PopulateOption[] = [
  {
    value: PopulateMode.Sample,
    label: 'browser.addKey.vectorSet.populate.sample.label',
    description: 'browser.addKey.vectorSet.populate.sample.description',
    id: 'populate-sample',
  },
  {
    value: PopulateMode.Manual,
    label: 'browser.addKey.vectorSet.populate.manual.label',
    description: 'browser.addKey.vectorSet.populate.manual.description',
    id: 'populate-manual',
  },
]

export const POPULATE_LABEL: ParseKeys =
  'browser.addKey.vectorSet.populateLabel'
