import React from 'react'
import cn from 'classnames'
import { mapSize, StyledText, TextProps } from './text.styles'

export const Text = ({
  className,
  color,
  size,
  textAlign,
  ...rest
}: TextProps) => {
  return (
    <StyledText
      {...rest}
      className={cn(className, 'RI-text')}
      $color={color}
      $align={textAlign}
      size={mapSize(size)}
    />
  )
}
