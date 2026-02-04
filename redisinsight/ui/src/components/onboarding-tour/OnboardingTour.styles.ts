import { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

export const Wrapper = styled.div<
  HTMLAttributes<HTMLDivElement> & { $fullSize?: boolean }
>`
  ${({ $fullSize }) =>
    $fullSize &&
    css`
      width: 100%;
      height: 100%;
    `}
`

export const PopoverPanel = styled.div<
  HTMLAttributes<HTMLDivElement> & { $isLastStep?: boolean }
>`
  ${({ $isLastStep }) =>
    $isLastStep &&
    css`
      & > span {
        display: none;
      }
    `}
`

export const SkipTourBtn = styled.div`
  display: flex;
  align-self: flex-end;
`
