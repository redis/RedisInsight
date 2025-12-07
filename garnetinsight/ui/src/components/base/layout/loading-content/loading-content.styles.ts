import { HTMLAttributes } from 'react'
import styled, { keyframes } from 'styled-components'
import { Theme } from 'uiSrc/components/base/theme/types'

export type LineRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface LoadingContentProps extends HTMLAttributes<HTMLDivElement> {
  lines?: LineRange
}

const loadingAnimation = keyframes`
  0% {
    transform: translateX(-53%);
  }

  100% {
    transform: translateX(0);
  }
`

export const StyledLoadingContent = styled.span<
  React.HtmlHTMLAttributes<HTMLSpanElement>
>`
  display: block;
  width: 100%;
`

export const SingleLine = styled.span<
  React.HtmlHTMLAttributes<HTMLSpanElement> & { theme: Theme }
>`
  display: block;
  width: 100%;
  height: ${({ theme }) => theme.core.space.space200};
  margin-bottom: ${({ theme }) => theme.core.space.space100};
  border-radius: ${({ theme }) => theme.core.space.space050};
  overflow: hidden;

  &:last-child:not(:only-child) {
    width: 75%;
  }
`

export const SingleLineBackground = styled.span<{ theme: Theme }>`
  display: block;
  width: 220%;
  height: 100%;
  background: linear-gradient(
    137deg,
    ${({ theme }) => theme.semantic.color.background.neutral200} 45%,
    ${({ theme }) => theme.semantic.color.background.neutral300} 50%,
    ${({ theme }) => theme.semantic.color.background.neutral200} 55%
  );
  animation: ${loadingAnimation} 1.5s ease-in-out infinite;
`
