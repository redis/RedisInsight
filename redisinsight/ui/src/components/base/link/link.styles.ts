import styled, { css } from 'styled-components'
import { Link as RedisUiLink } from '@redis-ui/components'
import { useTheme } from '@redis-ui/styles'
import { ColorType, MapProps } from './link.types'

const useColorTextStyles = ({ $color }: MapProps = {}) => {
  const theme = useTheme()
  const colors = theme.semantic.color
  const textColors = theme.components.typography.colors

  const getColorValue = (color?: ColorType) => {
    if (!color) {
      return textColors.primary
    }
    switch (color) {
      case 'inherit':
        return 'inherit'
      case 'default':
      case 'primary':
        return textColors.primary
      case 'text':
        return textColors.secondary
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
