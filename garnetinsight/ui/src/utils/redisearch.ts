import { FIELD_TYPE_OPTIONS } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

export const getFieldTypeOptions = () =>
  FIELD_TYPE_OPTIONS.map(({ value, text }) => ({
    value,
    inputDisplay: text,
    label: text,
  }))
