import styled, { css } from 'styled-components'

export const Wrapper = styled.div<{ $fullSize?: boolean }>`
  ${({ $fullSize }) =>
    $fullSize &&
    css`
      width: 100%;
      height: 100%;
    `}
`

export const PopoverPanel = styled.div<{ $isLastStep?: boolean }>`
  ${({ $isLastStep }) =>
    $isLastStep &&
    css`
      & > span {
        display: none;
      }
    `}
`

export const Header = styled.div``

export const SkipTourBtn = styled.span`
  display: flex;
  align-self: flex-end;
  font-size: 11px;
  line-height: 14px;
`

export const Content = styled.div``
