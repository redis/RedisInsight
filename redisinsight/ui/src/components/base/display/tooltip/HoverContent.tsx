import React from 'react'

import { RiCol } from 'uiSrc/components/base/layout'
import { RiTitle } from 'uiSrc/components/base/text'

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
