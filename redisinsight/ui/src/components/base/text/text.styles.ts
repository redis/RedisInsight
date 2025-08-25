import React, { HTMLAttributes } from 'react'
import { useTheme } from '@redis-ui/styles'
import { Typography } from '@redis-ui/components'
import styled, { css } from 'styled-components'
import { CommonProps } from 'uiSrc/components/base/theme/types'

export type BodyProps = React.ComponentProps<typeof Typography.Body>

export type EuiColorNames =
  | 'default'
  | 'subdued'
  | 'danger'
  | 'ghost'
  | 'accent'
  | 'warning'
  | 'success'
export type ColorType = BodyProps['color'] | EuiColorNames | (string & {})
export interface MapProps extends HTMLAttributes<HTMLElement> {
  $color?: ColorType
  $align?: 'left' | 'center' | 'right'
  $weight?: 'bold' | 'medium' | 'regular'
}

export type ColorTextProps = Omit<BodyProps, 'color' | 'size' | 'component'> & {
  color?: ColorType
  size?: BodyProps['size'] | 'm' | 's' | 'xs'
  component?: 'div' | 'span'
}

export type TextProps = Omit<BodyProps, 'color' | 'size'> &
  CommonProps & {
    color?: ColorType
    size?: BodyProps['size'] | 'm' | 's' | 'xs'
    textAlign?: 'left' | 'center' | 'right'
    weight?: 'bold' | 'medium' | 'regular'
  }

export const useColorTextStyles = ({ $color }: MapProps = {}) => {
  const theme = useTheme()
  const colors = theme.semantic.color
  // @ts-ignore
  const typographyColors = theme.components.typography.colors as Record<
    'primary' | 'secondary',
    string
  >
  const getColorValue = (color?: ColorType) => {
    if (!color) {
      return 'inherit'
    }
    switch (color) {
      case 'default':
      case 'primary':
        return typographyColors?.primary || colors.text.neutral800
      case 'secondary':
        return typographyColors?.secondary || colors.text.neutral700
      case 'subdued':
        return colors.text.informative400
      case 'danger':
        return colors.text.danger600
      case 'ghost':
        return colors.text.neutral600
      case 'accent':
        return colors.text.notice600
      case 'warning':
        return colors.text.attention600
      case 'success':
        return colors.text.success600
      default:
        return color // any supported color value e.g #fff
    }
  }

  return css`
    color: ${getColorValue($color)};
  `
}

const getAlignValue = (align?: MapProps['$align']) => {
  switch (align) {
    case 'left':
      return 'text-align: left'
    case 'center':
      return 'text-align: center'
    case 'right':
      return 'text-align: right'
    default:
      return ''
  }
}

const getWeightValue = (weight?: MapProps['$weight']) => {
  switch (weight) {
    case 'bold':
      return 'font-weight: 800'
    case 'medium':
      return 'font-weight: 600'
    case 'regular':
      return 'font-weight: 400'
    default:
      return ''
  }
}

export const StyledColorText = styled(Typography.Body)<MapProps>`
  ${useColorTextStyles}
`
export const StyledText = styled(Typography.Body)<MapProps>`
  ${useColorTextStyles};
  ${({ $align }) => getAlignValue($align)};
  ${({ $weight }) => getWeightValue($weight)};
`
export const Indicator = styled.div<
  {
    $color: ColorType
  } & CommonProps
>`
  width: 0.8rem;
  height: 0.8rem;
  border-radius: 50%;
  background-color: ${({ $color }) => $color || 'inherit'};
`
