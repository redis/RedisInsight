import React from 'react'

import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { FIELD_TYPE_OPTIONS } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import { FieldTagProps } from './FieldTag.types'
import { FIELD_TYPE_BADGE_VARIANT_MAP } from './constants'

export const FieldTag = ({ tag, dataTestId }: FieldTagProps) => {
  const tagLabel = FIELD_TYPE_OPTIONS.find(
    (option) => option.value === tag,
  )?.text

  return tagLabel ? (
    <RiBadge
      label={tagLabel}
      data-testid={dataTestId ?? 'field-tag'}
      variant={FIELD_TYPE_BADGE_VARIANT_MAP[tag]}
    />
  ) : null
}
