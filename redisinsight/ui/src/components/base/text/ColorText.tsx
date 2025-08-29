import React from 'react'
import cn from 'classnames'
import { ColorTextProps, mapSize, StyledColorText } from './text.styles'

export const ColorText = ({
  color,
  component = 'span',
  className,
  size,
  ...rest
}: ColorTextProps) => (
  <StyledColorText
    {...rest}
    size={mapSize(size)}
    component={component}
    $color={color}
    className={cn(className, { [`color__${color}`]: !!color }, 'RI-color-text')}
  />
)
