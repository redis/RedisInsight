import React from 'react'

import { Text } from 'uiSrc/components/base/text'
import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

import { useVectorSearch } from '../../context/vector-search'

export interface IndexListScreenProps {
  indexes: string[]
}

/**
 * Screen displaying the list of indexes.
 * This is a placeholder that will be enhanced later per RI-7967.
 */
export const IndexListScreen = ({ indexes }: IndexListScreenProps) => {
  const { openPickSampleDataModal } = useVectorSearch()

  return (
    <Col
      align="center"
      justify="center"
      grow={true}
      gap="m"
      data-testid="vector-search--index-list-screen"
    >
      <Text size="L">Index List</Text>
      <Text size="S">{indexes.length} index(es) found</Text>
      <Row>
        <PrimaryButton
          onClick={openPickSampleDataModal}
          data-testid="create-index-trigger-btn"
        >
          Create index
        </PrimaryButton>
      </Row>
    </Col>
  )
}
