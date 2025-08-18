import { HTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'
import { CommonProps, Theme } from 'uiBase/theme/types'

export const SpacerSizes = ['xs', 's', 'm', 'l', 'xl', 'xxl'] as const
export type SpacerSize = (typeof SpacerSizes)[number]

// Extract only the spaceXXX keys from the theme
export type ThemeSpacingKey = keyof Theme['core']['space'] // Allow direct theme spacing keys

export type ThemeSpacingValue = Theme['core']['space'][ThemeSpacingKey]

export type SpacerProps = CommonProps &
  HTMLAttributes<HTMLDivElement> & {
    children?: ReactNode
    size?: SpacerSize | ThemeSpacingKey | ThemeSpacingValue
  }

export const spacerStyles = {
  xs: 'var(--size-xs)', // 5px
  s: 'var(--size-s)', // 10px
  m: 'var(--size-m)', // 15px
  l: 'var(--size-l)', // 25px
  xl: 'var(--size-xl)', // 30px
  xxl: 'var(--size-xxl)', // 40px
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
