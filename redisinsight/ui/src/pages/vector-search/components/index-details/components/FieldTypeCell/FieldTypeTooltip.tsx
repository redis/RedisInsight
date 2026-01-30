import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { FieldTag } from 'uiSrc/components/new-index/create-index-step/field-box/FieldTag'
import { FieldTypes } from 'uiSrc/pages/browser/components/create-redisearch-index/constants'
import { Spacer } from 'uiSrc/components/base/layout'

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

export const FieldTypeTooltip = () => (
  <Col gap="m">
    <Text size="L" color="primary">
      Indexing type & options
    </Text>

    <Text color="secondary">
      Defines how Redis searches this field and how it behaves at query time.
      Available indexing types:
    </Text>

    <Spacer size="s" />
    {FIELD_TYPE_DESCRIPTIONS.map(({ type, description }) => (
      <Row key={type} gap="s" style={{ whiteSpace: 'nowrap' }}>
        <FieldTag tag={type} />
        <Text>{description}</Text>
      </Row>
    ))}
    <Spacer size="s" />

    <Text color="secondary">
      Optional settings may affect performance, storage, or ranking.
    </Text>
  </Col>
)
