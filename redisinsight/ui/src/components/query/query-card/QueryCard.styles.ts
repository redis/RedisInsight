import { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

type DivProps = HTMLAttributes<HTMLDivElement>

interface ContainerWrapperProps extends DivProps {
  $isOpen?: boolean
  $isFullscreen?: boolean
  $odd?: boolean
}

export const ContainerWrapper = styled.div<ContainerWrapperProps>`
  min-width: 662px;

  @media (min-width: 1050px) {
    min-width: 762px;
  }

  ${({ $odd, theme }) =>
    $odd
      ? css`
          background-color: ${(theme as Theme).semantic.color.background
            .neutral100};
        `
      : css`
          background-color: ${(theme as Theme).semantic.color.background
            .neutral200};
        `}

  ${({ $isOpen, theme }) =>
    $isOpen &&
    css`
      & + &.isOpen .container {
        border-top-width: 0;
      }

      .container {
        border-color: ${(theme as Theme).semantic.color.border.primary500};
      }
    `}

  ${({ $isFullscreen, theme }) =>
    $isFullscreen &&
    css`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 110;
      background-color: ${(theme as Theme).semantic.color.background
        .neutral100};

      .queryResultsContainer {
        max-height: calc(100% - 45px);
      }

      .queryResultsContainer.pluginStyles {
        max-height: calc(100vh - 45px);
      }

      .container {
        border-color: ${(theme as Theme).semantic.color.border.neutral300};
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      &.isOpen .container {
        border: none;
      }
    `}
`

export const Container = styled.div<DivProps>`
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.neutral500};
`

export const Loading = styled.div<DivProps>`
  height: 17px;
  max-width: 600px;
`

// Global styles for query card output responses
export const QueryCardOutputSuccess = styled.div`
  scrollbar-width: thin;
  display: block;
  max-height: 210px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.success500};
`

export const QueryCardOutputFail = styled.span`
  color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.text.danger500};

  span {
    vertical-align: text-top;
  }
`
