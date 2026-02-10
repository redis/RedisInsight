import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { Col } from 'uiSrc/components/base/layout/flex'

export interface IndexListScreenProps {
  indexes: string[]
}

/**
 * Screen displaying the list of indexes.
 * This is a placeholder that will be enhanced later per RI-7967.
 */
export const IndexListScreen = ({ indexes }: IndexListScreenProps) => (
  <Col
    align="center"
    justify="center"
    data-testid="vector-search--index-list-screen"
  >
    <Text size="L">Index List</Text>
    <Text size="S">{indexes.length} index(es) found</Text>
  </Col>
)
