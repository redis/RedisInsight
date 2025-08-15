import React from 'react'
import { LinkProps } from '@redis-ui/components'
import { StyledLink } from 'uiSrc/components/base/link/link.styles'

export const Link = ({ color, ...props }: LinkProps) => (
  <StyledLink {...props} $color={color} />
)
