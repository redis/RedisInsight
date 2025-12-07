import {
  PanelResizeHandle,
  PanelResizeHandleProps,
} from 'react-resizable-panels'
import styled, { css } from 'styled-components'

export interface ResizablePanelHandleProps extends PanelResizeHandleProps {
  direction?: 'horizontal' | 'vertical'
}

export const StyledPanelResizeHandle = styled(PanelResizeHandle)<{
  $direction: 'horizontal' | 'vertical'
}>`
  ${({ $direction }) =>
    $direction === 'vertical'
      ? css`
          width: 16px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        `
      : css`
          height: 16px;
          width: 100%;
          display: flex;
          flex-direction: row;
          justify-content: center;
        `}
`

export const HandleContainer = styled.div<{
  $direction: 'horizontal' | 'vertical'
  children?: React.ReactNode
}>`
  width: 16px;
  height: 16px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2px;

  ${({ $direction }) =>
    $direction === 'vertical' &&
    css`
      transform: rotate(90deg);
    `}
`

export const Line = styled.div`
  width: 12px;
  height: 1px;
  background-color: #343741;
`
