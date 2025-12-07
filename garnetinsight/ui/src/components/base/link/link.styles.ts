import styled, { css } from 'styled-components'
import { Link as RedisUiLink, LinkProps } from '@redis-ui/components'
import { useTheme } from '@redis-ui/styles'

// TODO [DA]: Export the color functionality and use both for Link and Text
export type EuiColorNames =
  | 'inherit'
  | 'default'
  | 'primary'
  | 'text'
  | 'subdued'
  | 'danger'
  | 'ghost'
  | 'accent'
  | 'warning'
  | 'success'

export type ColorType = LinkProps['color'] | EuiColorNames | (string & {})

export type RiLinkProps = Omit<LinkProps, 'color'> & {
  color?: ColorType
  underline?: boolean
}

type MapProps = RiLinkProps & {
  $color?: ColorType
  $underline?: boolean
}

export const useColorTextStyles = ({ $color }: MapProps = {}) => {
  const theme = useTheme()
  const colors = theme.semantic.color

  const getColorValue = (color?: ColorType) => {
    if (!color) {
      return colors.text.primary500
    }
    switch (color) {
      case 'inherit':
        return 'inherit'
      case 'default':
      case 'primary':
        return colors.text.primary500
      case 'text':
        return colors.text.neutral700
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

export const StyledLink = styled(RedisUiLink)<MapProps>`
  ${useColorTextStyles};
  text-decoration: ${({ $underline }) =>
    $underline ? 'underline' : 'none'} !important;
  & > span {
    text-decoration: ${({ $underline }) =>
      $underline ? 'underline' : 'none'} !important;
  }
  &:hover {
    text-decoration: underline !important;
  }
`
