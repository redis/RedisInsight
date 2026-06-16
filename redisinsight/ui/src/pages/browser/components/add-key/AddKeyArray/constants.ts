import type { PopulateOption } from './AddKeyArray.types'

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
