import { HTMLAttributes, ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { CommonProps, Theme } from 'uiSrc/components/base/theme/types'

export type SpacerSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl'

// Extract only the spaceXXX keys from the theme
export type ThemeSpacingKey = Extract<
  keyof Theme['core']['space'],
  `space${string}`
>

export type SpacerProps = CommonProps &
  HTMLAttributes<HTMLDivElement> & {
    children?: ReactNode
    size?: SpacerSize | ThemeSpacingKey | string
    direction?: 'horizontal' | 'vertical'
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

const getSpacingValue = (
  size: SpacerSize | ThemeSpacingKey | string,
  theme: Theme,
): string | ReturnType<typeof css> => {
  // Check if it's a theme spacing key
  if (size in theme.core.space) {
    return theme.core.space[size as ThemeSpacingKey]
  }

  // Check if it's a legacy spacer size
  if (size in spacerStyles) {
    return spacerStyles[size as SpacerSize]
  }

  // Custom string value (e.g., '7.2rem', '72px')
  return size
}

type StyledSpacerType = Omit<SpacerProps, 'direction'> & {
  $direction: SpacerProps['direction']
}

export const StyledSpacer = styled.div<StyledSpacerType>`
  flex-shrink: 0;
  ${({ $direction = 'vertical', size = 'l', theme }) => {
    const spacingValue = getSpacingValue(size, theme)

    return $direction === 'horizontal'
      ? css`
          width: ${spacingValue};
        `
      : css`
          height: ${spacingValue};
        `
  }}
`
