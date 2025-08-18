import React from 'react'

import { RiCol } from 'uiBase/layout'
import { RiTitle } from 'uiBase/text'

interface RiTooltipContentProps {
  title?: React.ReactNode
  content: React.ReactNode
}

export const HoverContent = ({ title, content }: RiTooltipContentProps) => (
  <RiCol>
    {title && <RiTitle size="S">{title}</RiTitle>}
    {content}
  </RiCol>
)
