import React from 'react'
export { type LinkProps } from '@redis-ui/components'
import {
  StyledLink,
  type RiLinkProps,
} from 'uiSrc/components/base/link/link.styles'
export { type RiLinkProps }

export const Link = ({ color, ...props }: RiLinkProps) => (
  <StyledLink {...props} $color={color} />
)
