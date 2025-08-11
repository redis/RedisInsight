import React, { HTMLAttributes } from 'react'
import { useTheme } from '@redis-ui/styles'
import { Typography } from '@redis-ui/components'
import styled, { css } from 'styled-components'
import { CommonProps } from 'uiBase/theme/types'

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
}

export type ColorTextProps = Omit<BodyProps, 'color' | 'size' | 'component'> & {
  color?: ColorType
  component?: 'div' | 'span'
}

export type TextProps = Omit<
  React.ComponentProps<typeof Typography.Body>,
  'color' | 'size'
> &
  CommonProps & {
    color?: ColorType
    size?:
      | React.ComponentProps<typeof Typography.Body>['size']
      | 'm'
      | 's'
      | 'xs'
    textAlign?: 'left' | 'center' | 'right'
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

export const StyledColorText = styled(Typography.Body)<MapProps>`
  ${useColorTextStyles}
`
export const StyledText = styled(Typography.Body)<MapProps>`
  ${useColorTextStyles};
  ${({ $align }) => getAlignValue($align)};
`
export const Indicator = styled.div<
  {
    $color: ColorType
  } & CommonProps
>`
  width: var(--size-s);
  height: var(--size-s);
  border-radius: 50%;
  background-color: ${({ $color }) => $color || 'inherit'};
`
