import React from 'react'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

import { type EmptyStateProps } from './EmptyState.types'

export const EmptyState = ({ message }: EmptyStateProps) => (
  <Col centered full>
    <FlexItem padding={13}>
      <Text size="L">{message}</Text>
    </FlexItem>
  </Col>
)

