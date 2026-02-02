import React from 'react'
import { Badge } from '@redis-ui/components'
import { FIELD_TYPE_OPTIONS } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { FieldTagProps } from './FieldTag.types'

// TODO: Add colors mapping for tags when @redis-ui/components v38.6.0 is released
export const FieldTag = ({ tag, dataTestId }: FieldTagProps) => {
  const tagLabel = FIELD_TYPE_OPTIONS.find(
    (option) => option.value === tag,
  )?.text

  return tagLabel ? (
    <Badge label={tagLabel} data-testid={dataTestId ?? 'field-tag'} />
  ) : null
}
