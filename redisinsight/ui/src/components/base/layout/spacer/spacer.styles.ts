import { HTMLAttributes, ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { CommonProps, Theme } from 'uiSrc/components/base/theme/types'

export type SpacerSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'

// Extract only the spaceXXX keys from the theme
export type ThemeSpacingKey = Extract<
  keyof Theme['core']['space'],
  `space${string}`
>
// Allow direct theme spacing values
export type ThemeSpacingValue = Theme['core']['space'][ThemeSpacingKey]

export type SpacerProps = CommonProps &
  HTMLAttributes<HTMLDivElement> & {
    children?: ReactNode
    size?: SpacerSize | ThemeSpacingKey | ThemeSpacingValue
  }

export const spacerStyles: Record<SpacerSize, ReturnType<typeof css>> = {
  xs: css`
    ${({ theme }: { theme: Theme }) => theme.core.space.space025}
  `,
  s: css`
    ${({ theme }: { theme: Theme }) => theme.core.space.space050}
  `,
  m: css`
    ${({ theme }: { theme: Theme }) => theme.core.space.space100}
  `,
  l: css`
    ${({ theme }: { theme: Theme }) => theme.core.space.space200}
  `,
  // @see redisinsight/ui/src/styles/base/_base.scss:124
  xl: css`
    ${({ theme }: { theme: Theme }) => theme.core.space.space250}
  `,
  xxl: css`
    ${({ theme }: { theme: Theme }) => theme.core.space.space300}
  `,
}

const isThemeSpacingKey = (
  size: SpacerSize | ThemeSpacingKey | ThemeSpacingValue,
  theme: Theme,
): size is ThemeSpacingKey =>
  typeof size === 'string' && size in theme.core.space

const getSpacingValue = (
  size: SpacerSize | ThemeSpacingKey | ThemeSpacingValue,
  theme: Theme,
): string | ReturnType<typeof css> => {
  if (isThemeSpacingKey(size, theme)) {
    return theme?.core?.space?.[size] || '0'
  }

  return spacerStyles[size as SpacerSize]
}

export const StyledSpacer = styled.div<SpacerProps>`
  flex-shrink: 0;
  height: ${({ size = 'l', theme }) => getSpacingValue(size, theme)};
`
