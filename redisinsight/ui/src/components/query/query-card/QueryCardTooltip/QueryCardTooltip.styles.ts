import styled, { css } from 'styled-components'

export const TOOLTIP_MAX_WIDTH = '400px'

export const QueryLine = styled.div<{
  $multiLine?: boolean
  $folding?: boolean
}>`
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  position: relative;

  ${({ $multiLine }) =>
    $multiLine &&
    css`
      padding-left: 40px;
    `}

  ${({ $folding }) =>
    $folding &&
    css`
      & > span {
        opacity: 0.4;
      }
    `}
`

export const QueryLineNumber = styled.div<{ $folding?: boolean }>`
  position: absolute;
  display: flex;
  left: 0;
  justify-content: flex-end;
  width: 26px;

  ${({ $folding }) =>
    $folding &&
    css`
      opacity: 0.4;
    `}
`

export const TooltipAnchor = styled.span`
  cursor: pointer;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
