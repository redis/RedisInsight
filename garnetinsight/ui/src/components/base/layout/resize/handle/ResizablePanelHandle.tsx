import React from 'react'
import {
  HandleContainer,
  Line,
  ResizablePanelHandleProps,
  StyledPanelResizeHandle,
} from './resizable-panel-handle.styles'

const ResizablePanelHandle = ({
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

export default ResizablePanelHandle
