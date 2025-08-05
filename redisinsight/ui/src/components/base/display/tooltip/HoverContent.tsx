import React from 'react'

import { RiCol } from 'uiSrc/components/base/layout'
import { Title } from 'uiSrc/components/base/text'

interface RiTooltipContentProps {
  title?: React.ReactNode
  content: React.ReactNode
}

export const HoverContent = ({ title, content }: RiTooltipContentProps) => (
  <RiCol>
    {title && <Title size="S">{title}</Title>}
    {content}
  </RiCol>
)
