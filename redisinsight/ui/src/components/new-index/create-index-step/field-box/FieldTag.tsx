import React from 'react'
import { Badge } from '@redis-ui/components'
import {
  FIELD_TYPE_OPTIONS,
  FieldTypes,
} from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

// TODO: Add colors mapping for tags when @redis-ui/components v38.6.0 is released
export const FieldTag = ({ tag }: { tag: FieldTypes }) => {
  const tagLabel = FIELD_TYPE_OPTIONS.find(
    (option) => option.value === tag,
  )?.text

  return tagLabel ? <Badge label={tagLabel} /> : null
}
