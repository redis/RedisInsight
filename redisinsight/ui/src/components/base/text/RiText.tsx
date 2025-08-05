import React from 'react'
import cn from 'classnames'
import { BodySizesType } from '@redis-ui/components/dist/Typography/components/Body/Body.types'
import { StyledText, TextProps } from './text.styles'

export const RiText = ({
  className,
  color,
  size,
  textAlign,
  ...rest
}: TextProps) => {
  const sizeMap = {
    size,
  }
  if (size === 'm') {
    sizeMap.size = 'M'
  } else if (size === 's') {
    sizeMap.size = 'S'
  } else if (size === 'xs') {
    sizeMap.size = 'XS'
  }
  return (
    <StyledText
      {...rest}
      className={cn(className, 'RI-text')}
      $color={color}
      $align={textAlign}
      size={sizeMap.size as BodySizesType}
    />
  )
}
