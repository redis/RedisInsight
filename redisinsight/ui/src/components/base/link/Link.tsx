import React from 'react'
import * as S from 'uiSrc/components/base/link/link.styles'
import { type RiLinkProps } from './link.types'

export const Link = ({ color, underline, ...props }: RiLinkProps) => (
  <S.StyledLink {...props} $color={color} $underline={underline} />
)
