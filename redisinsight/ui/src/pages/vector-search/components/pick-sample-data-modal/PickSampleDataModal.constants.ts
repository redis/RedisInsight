import {
  SampleDataContent,
  SampleDataOption,
} from './PickSampleDataModal.types'

export const MODAL_TITLE = 'Getting your sample data ready for Search'
export const MODAL_SUBTITLE_LINE_1 = 'Select a sample dataset.'
export const MODAL_SUBTITLE_LINE_2 =
  "We'll load the data and generate the index needed for search."
export const CANCEL_BUTTON_TEXT = 'Cancel'
export const SEE_INDEX_DEFINITION_BUTTON_TEXT = 'See index definition'
export const START_QUERYING_BUTTON_TEXT = 'Start querying'

export const SAMPLE_DATA_OPTIONS: SampleDataOption[] = [
  {
    value: SampleDataContent.E_COMMERCE_DISCOVERY,
    label: 'E-commerce Discovery',
    description: 'Discover products that match intent, not just text',
  },
  {
    value: SampleDataContent.CONTENT_RECOMMENDATIONS,
    label: 'Content recommendations',
    description: 'Discover content by theme or plot.',
  },
]
