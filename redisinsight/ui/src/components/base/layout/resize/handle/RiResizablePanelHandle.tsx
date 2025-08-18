import React from 'react'
import {
  HandleContainer,
  Line,
  ResizablePanelHandleProps,
  StyledPanelResizeHandle,
} from './resizable-panel-handle.styles'

export const RiResizablePanelHandle = ({
  className,
  direction = 'vertical',
  ...rest
}: ResizablePanelHandleProps) => (
  <StyledPanelResizeHandle
    $direction={direction}
    className={className}
    {...rest}
  >
    <HandleContainer $direction={direction}>
      <Line />
      <Line />
    </HandleContainer>
  </StyledPanelResizeHandle>
)
