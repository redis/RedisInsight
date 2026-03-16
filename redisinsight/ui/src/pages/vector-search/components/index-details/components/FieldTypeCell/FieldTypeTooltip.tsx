import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'
import { IndexingTypeContent } from '../../../../components/field-type-list'

export const FieldTypeTooltip = () => (
  <Col gap="m">
    <Text size="L" color="primary">
      Indexing type & options
    </Text>
    <IndexingTypeContent />
  </Col>
)
