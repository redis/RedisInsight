import React from 'react'
import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'

export const FieldValueTooltip = () => (
  <Col gap="m">
    <Text size="L" color="primary">
      Field sample value
    </Text>
    <Text color="secondary">
      A sample value from the data to be indexed. Use it to verify the field
      type and indexing choice.
    </Text>
  </Col>
)
