import React from 'react'
import cn from 'classnames'
import * as S from './text.styles'
import { TextProps } from './text.types'

export const Text = ({
  className,
  color,
  size,
  textAlign,
  ...rest
}: TextProps) => {
  return (
    <S.StyledText
      {...rest}
      className={cn(className, 'RI-text')}
      $color={color}
      $align={textAlign}
      size={S.mapSize(size)}
    />
  )
}
