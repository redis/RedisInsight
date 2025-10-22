import React from 'react'

import { Col } from 'uiSrc/components/base/layout/flex'
import { Title } from 'uiSrc/components/base/text'

interface RiTooltipContentProps {
  title?: React.ReactNode
  content: React.ReactNode
}
const renderTitle = (title: React.ReactNode) => {
  if (!title) {
    return null
  }
  if (typeof title === 'string') {
    return <Title size="XS">{title}</Title>
  }
  return title
}
export const HoverContent = ({ title, content }: RiTooltipContentProps) => {
  return (
    <Col gap="s">
      {renderTitle(title)}
      {content}
    </Col>
  )
}
