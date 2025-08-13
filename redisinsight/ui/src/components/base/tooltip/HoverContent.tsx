import React from 'react'

import { Col } from 'uiSrc/components/base/layout/flex'
import { Title } from 'uiSrc/components/base/text'

interface RiTooltipContentProps {
  title?: React.ReactNode
  content: React.ReactNode
}

export const HoverContent = ({ title, content }: RiTooltipContentProps) => (
  <Col gap="s">
    {title && <Title size="XS">{title}</Title>}
    {content}
  </Col>
)
