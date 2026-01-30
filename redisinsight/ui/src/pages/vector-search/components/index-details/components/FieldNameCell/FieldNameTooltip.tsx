import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'

export const FieldNameTooltip = () => (
  <Col gap="m">
    <Text size="L" color="primary">
      Field name
    </Text>
    <Text color="secondary">
      Represents a searchable attribute in your data. Only selected fields will
      be searchable.
    </Text>
  </Col>
)
