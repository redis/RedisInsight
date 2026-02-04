import React from 'react'
import cn from 'classnames'
import * as S from './text.styles'
import { type ColorTextProps } from './text.types'

export const ColorText = ({
  color,
  component = 'span',
  className,
  size,
  ...rest
}: ColorTextProps) => (
  <S.StyledColorText
    {...rest}
    size={S.mapSize(size)}
    component={component}
    $color={color}
    className={cn(className, { [`color__${color}`]: !!color }, 'RI-color-text')}
  />
)
