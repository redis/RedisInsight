import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'

/**
 * Screen displayed when RediSearch/Query Engine is not available.
 * This is a placeholder that will be enhanced later.
 */
export const RqeNotAvailableScreen = () => (
  <Col
    align="center"
    justify="center"
    data-testid="vector-search--rqe-not-available-screen"
  >
    <Text size="L">RediSearch Not Available</Text>
    <Text size="S">
      The RediSearch module is required for Vector Search functionality.
    </Text>
  </Col>
)
