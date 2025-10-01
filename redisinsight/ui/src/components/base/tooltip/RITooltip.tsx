import React from 'react'

import { TooltipProvider, Tooltip, TooltipProps } from '@redis-ui/components'
import { HoverContent } from './HoverContent'
import styled from 'styled-components'

export interface RiTooltipProps
  extends Omit<TooltipProps, 'placement' | 'openDelayDuration'> {
  title?: React.ReactNode
  position?: TooltipProps['placement']
  delay?: TooltipProps['openDelayDuration']
  anchorClassName?: string
}

const StyledTooltip = styled(Tooltip)`
  word-break: break-word;
`

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
    <StyledTooltip
      {...props}
      content={
        (content || title) && <HoverContent title={title} content={content} />
      }
      placement={position}
      openDelayDuration={delay}
    >
      <span className={anchorClassName}>{children}</span>
    </StyledTooltip>
  </TooltipProvider>
)
