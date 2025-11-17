import React from 'react'

import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

import { type NoMastersMessageProps } from './NoMastersMessage.types'

export const NoMastersMessage = ({ message }: NoMastersMessageProps) => (
  <Col centered full>
    <Text size="L">{message}</Text>
  </Col>
)
