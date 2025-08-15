import React from 'react'

import { TooltipProvider, Tooltip, TooltipProps } from '@redis-ui/components'
import { HoverContent } from './HoverContent'

export interface RiTooltipProps
  extends Omit<TooltipProps, 'placement' | 'openDelayDuration'> {
  title?: React.ReactNode
  position?: TooltipProps['placement']
  delay?: TooltipProps['openDelayDuration']
  anchorClassName?: string
}

export const RiTooltip = ({
  children,
  title,
  content,
  position,
  delay,
  anchorClassName,
  ...props
}: RiTooltipProps) => (
  <TooltipProvider>
    <Tooltip
      {...props}
      content={
        (content || title) && <HoverContent title={title} content={content} />
      }
      placement={position}
      openDelayDuration={delay}
    >
      <span className={anchorClassName}>{children}</span>
    </Tooltip>
  </TooltipProvider>
)
