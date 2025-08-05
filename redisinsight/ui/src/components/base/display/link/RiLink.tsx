import React from 'react'
import { LinkProps } from '@redis-ui/components'
import { StyledLink } from './link.styles'

export const RiLink = ({ color, ...props }: LinkProps) => (
  <StyledLink {...props} $color={color} />
)
