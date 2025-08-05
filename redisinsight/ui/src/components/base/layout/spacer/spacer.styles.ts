import { HTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'
import { CommonProps, Theme } from 'uiSrc/components/base/theme/types'
import { theme } from 'uiSrc/components/base/theme'

export const SpacerSizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'] as const
export type SpacerSize = (typeof SpacerSizes)[number]

// Extract only the spaceXXX keys from the theme
export type ThemeSpacingKey = Extract<
  keyof typeof theme.semantic.core.space,
  `space${string}`
>
// Allow direct theme spacing values
export type ThemeSpacingValue =
  (typeof theme.semantic.core.space)[ThemeSpacingKey]

export type SpacerProps = CommonProps &
  HTMLAttributes<HTMLDivElement> & {
    children?: ReactNode
    size?: SpacerSize | ThemeSpacingKey | ThemeSpacingValue
  }

export const spacerStyles = {
  xs: 'var(--size-xs)',
  s: 'var(--size-s)',
  m: 'var(--size-m)',
  l: 'var(--size-l)',
  // @see redisinsight/ui/src/styles/base/_base.scss:124
  xl: 'calc(var(--base) * 2.25)',
  xxl: 'var(--size-xxl)',
}

const isThemeSpacingKey = (
  size: SpacerSize | ThemeSpacingKey | ThemeSpacingValue,
  theme: Theme,
): size is ThemeSpacingKey => size in theme.core.space

const getSpacingValue = (
  size: SpacerSize | ThemeSpacingKey | ThemeSpacingValue,
  theme: Theme,
): string => {
  const themeSpacingValues = Object.values(theme.core.space)
  if (themeSpacingValues.includes(size)) {
    return size
  }

  if (isThemeSpacingKey(size, theme)) {
    return theme?.core?.space?.[size] || '0'
  }

  return spacerStyles[size as SpacerSize]
}

export const StyledSpacer = styled.div<SpacerProps>`
  flex-shrink: 0;
  height: ${({ size = 'l', theme }) => getSpacingValue(size, theme)};
`
