import React from 'react'

import { DividerProps } from './Divider.types'
import * as S from './Divider.styles'

const Divider = ({ orientation, variant, color, ...props }: DividerProps) => (
  <S.DividerWrapper {...props}>
    <S.Divider $variant={variant} $orientation={orientation} $color={color} />
  </S.DividerWrapper>
)

export default Divider
