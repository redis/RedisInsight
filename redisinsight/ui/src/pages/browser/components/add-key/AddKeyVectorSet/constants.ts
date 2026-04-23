import { PopulateOption } from './AddKeyVectorSet.types'

export enum PopulateMode {
  Sample = 'sample',
  Manual = 'manual',
}

export const POPULATE_OPTIONS: PopulateOption[] = [
  {
    value: PopulateMode.Sample,
    label: 'Load sample dataset',
    description: 'Explore vector sets with pre-loaded word embeddings',
    disabled: true,
    id: 'populate-sample',
  },
  {
    value: PopulateMode.Manual,
    label: 'Create manually',
    description: 'Define your own key, elements, and vectors from scratch.',
    id: 'populate-manual',
  },
]

export const POPULATE_LABEL = 'How would you like to populate this vector set?'
