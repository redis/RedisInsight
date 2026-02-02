import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Container = styled.div`
  display: flex;
  align-items: center;
  & > div {
    display: flex;
    align-items: center;
  }
`

export const Separator = styled.div`
  margin: 0 4px;
`

export const Badge = styled.span<{ $transparent?: boolean }>`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral300};
  border: 1px solid
    ${({ theme }: { theme: Theme }) => theme.semantic.color.border.success500};

  ${({ $transparent, theme }) =>
    $transparent &&
    css`
      background-color: transparent;
      border-color: ${(theme as Theme).semantic.color.border.neutral500};
    `}
`
