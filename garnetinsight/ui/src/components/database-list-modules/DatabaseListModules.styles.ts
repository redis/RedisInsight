import React from 'react'
import styled, { css } from 'styled-components'

export interface StyledContainerProps {
  $unstyled?: boolean
  $highlight?: boolean
  $inCircle?: boolean
  children?: React.ReactNode
}

const highlightStyles = css`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral300};
  border-radius: ${({ theme }) => theme.core.space.space150};
`

const inCircleStyles = css`
  height: ${({ theme }) => theme.core.space.space400};
`

export const StyledContainer = styled.div<StyledContainerProps>`
  ${({ $unstyled, $highlight, $inCircle }) =>
    !$unstyled &&
    css`
      height: ${({ theme }) => theme.core.space.space300};
      line-height: ${({ theme }) => theme.core.space.space250};
      display: inline-block;
      width: auto;
      padding-left: ${({ theme }) => theme.core.space.space050};
      padding-right: ${({ theme }) => theme.core.space.space050};

      ${$highlight && highlightStyles}

      ${$inCircle && inCircleStyles}
    `}
`
