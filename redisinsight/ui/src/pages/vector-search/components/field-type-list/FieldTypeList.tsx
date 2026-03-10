import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'
import { FieldTag } from 'uiSrc/components/new-index/create-index-step/field-box/FieldTag'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'

import * as S from './FieldTypeList.styles'

const FIELD_TYPE_DESCRIPTIONS: { type: FieldTypes; description: string }[] = [
  {
    type: FieldTypes.TEXT,
    description: 'Full-text search and relevance scoring',
  },
  { type: FieldTypes.TAG, description: 'Exact matching and filtering' },
  { type: FieldTypes.NUMERIC, description: 'Range queries and sorting' },
  {
    type: FieldTypes.GEO,
    description: 'Geographic distance and radius queries',
  },
  { type: FieldTypes.VECTOR, description: 'Similarity and semantic search' },
]

export const IndexingTypeContent = () => (
  <Col gap="m" data-testid="create-index-onboarding-indexing-types">
    <Text size="m" color="secondary">
      Defines how Redis searches this field and how it behaves at query time.
      Available indexing types:
    </Text>

    {FIELD_TYPE_DESCRIPTIONS.map(({ type, description }) => (
      <S.FieldTypeRow key={type} gap="s">
        <FieldTag tag={type} />
        <Text>{description}</Text>
      </S.FieldTypeRow>
    ))}

    <Text size="m" color="secondary">
      Optional settings may affect performance, storage, or ranking.
    </Text>
  </Col>
)
