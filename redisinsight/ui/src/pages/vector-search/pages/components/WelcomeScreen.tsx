import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'

/**
 * Welcome screen displayed when no indexes exist.
 * This is a placeholder that will be enhanced later per RI-7905.
 */
export const WelcomeScreen = () => (
  <Col
    align="center"
    justify="center"
    data-testid="vector-search--welcome-screen"
  >
    <Text size="L">Welcome to Vector Search</Text>
    <Text size="S">
      No indexes found. Create your first index to get started.
    </Text>
  </Col>
)
