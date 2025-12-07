import { Theme, theme } from '@redis-ui/styles'
import { ReactNode } from 'react'
import styled, { css, keyframes } from 'styled-components'

export type EuiColorNames =
  | 'inherit'
  | 'default'
  | 'primary'
  | 'danger'
  | 'warning'
  | 'success'

interface LoaderBarProps {
  color?: string
}

export type ColorType = EuiColorNames | (string & {})
type ThemeColors = typeof theme.semantic.color

export const getBarBackgroundColor = (
  themeColors: ThemeColors,
  color?: ColorType,
) => {
  if (!color) {
    return themeColors.background.primary300
  }

  const barBackgroundColors: Record<ColorType, string> = {
    inherit: 'inherit',
    default: themeColors.background.primary300,
    primary: themeColors.background.primary300,
    danger: themeColors.background.danger600,
    warning: themeColors.background.attention600,
    success: themeColors.background.success600,
  }

  return barBackgroundColors[color] ?? color
}

export interface MapProps extends LoaderBarProps {
  $color?: ColorType
  theme: Theme
}

export const getColorBackgroundStyles = ({ $color, theme }: MapProps) => {
  const colors = theme.semantic.color

  const getColorValue = (color?: ColorType) =>
    getBarBackgroundColor(colors, color)

  return css`
    background-color: ${getColorValue($color)};
  `
}

const loading = keyframes`
  0% {
    transform: scaleX(1) translateX(-100%);
  }
  100% {
    transform: scaleX(1) translateX(100%);
  }
`

interface LoaderContainerProps {
  children?: ReactNode
  style?: React.CSSProperties
  className?: string
  absolute?: boolean
}

export const LoaderContainer = styled.div<LoaderContainerProps>`
  position: ${({ absolute }) => (absolute ? 'absolute' : 'relative')};
  width: 100%;
  height: 3px;
  overflow: hidden;
  border-radius: 2px;
`

export const LoaderBar = styled.div<MapProps>`
  ${({ $color, theme }) => getColorBackgroundStyles({ $color, theme })};

  position: absolute;
  height: 100%;
  width: 100%;
  border-radius: 2px;

  animation: ${loading} 1s ease-in-out infinite;
`

export type ProgressBarLoaderProps = LoaderContainerProps & LoaderBarProps
