import styled, { css } from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Text = styled.span<{ $insights?: boolean }>`
  font:
    normal normal normal 14px/24px Graphik,
    sans-serif;

  ${({ $insights, theme }) =>
    $insights &&
    css`
      color: ${(theme as Theme).components.typography.colors.primary};
    `}
`

export const Span = styled.span`
  display: inline;
`

export const List = styled.ul`
  list-style: initial;
  padding-left: 21px;
  margin: 0;
`

export const ListItem = styled.li<{ $insights?: boolean }>`
  &::marker {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.neutral600};
  }

  ${({ $insights, theme }) =>
    $insights &&
    css`
      &::marker {
        color: ${(theme as Theme).components.typography.colors.primary};
      }
    `}
`

export const Code = styled.span<{ $insights?: boolean }>`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral300};
  border-radius: 4px;
  padding: 3px 6px;

  ${({ $insights, theme }) =>
    $insights &&
    css`
      background-color: ${(theme as Theme).semantic.color.background
        .neutral200};
    `}

  code {
    font-family: 'Roboto Mono', Consolas, Menlo, Courier, monospace;
  }
`

export const BadgesLegend = styled.div`
  margin: 0 22px 14px 0;
  padding-top: 20px;
`

export const BadgeWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 24px;
`

export const Badge = styled.span`
  margin: 0 0 0 24px;
`

export const BadgeIcon = styled.span`
  fill: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.icon.neutral600};
  margin-right: 14px;
`
