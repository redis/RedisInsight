import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

export type SavedIndex = {
  value: string
  tags: FieldTypes[]
  queries: {
    label: string
    value: string
  }[]
}
