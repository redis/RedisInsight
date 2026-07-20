import i18n from 'uiSrc/i18n'

import {
  SampleDataContent,
  SampleDataOption,
} from './PickSampleDataModal.types'

// Built at call time (not module scope) so label/description resolve in the
// active language; the enum `value` stays stable as an identifier.
export const getSampleDataOptions = (): SampleDataOption[] => [
  {
    value: SampleDataContent.E_COMMERCE_DISCOVERY,
    label: i18n.t('vectorSearch.sampleData.ecommerce.label'),
    description: i18n.t('vectorSearch.sampleData.ecommerce.description'),
  },
  {
    value: SampleDataContent.CONTENT_RECOMMENDATIONS,
    label: i18n.t('vectorSearch.sampleData.content.label'),
    description: i18n.t('vectorSearch.sampleData.content.description'),
  },
]
