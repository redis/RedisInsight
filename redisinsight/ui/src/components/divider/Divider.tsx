import React from 'react'

import * as S from './Divider.styles'
import { DividerProps } from './Divider.types'

const Divider = ({
  orientation,
  variant,
  color,
  className: _className,
  ...props
}: DividerProps) => (
  <S.DividerWrapper {...props}>
    <S.Divider
      className={_className}
      $variant={variant}
      $orientation={orientation}
      $color={color}
    />
  </S.DividerWrapper>
)

export default Divider
