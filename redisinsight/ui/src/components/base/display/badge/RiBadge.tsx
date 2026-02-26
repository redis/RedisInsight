import React from 'react'
import { Badge, BadgeVariants } from '@redis-ui/components'

type RiBadgeProps = Omit<React.ComponentProps<typeof Badge>, 'label'> & {
  children?: React.ReactNode
  label?: React.ReactNode
}
export const RiBadge = ({ children, label, ...rest }: RiBadgeProps) => {
  let internalLabel: React.ReactNode = label
  if (children && !internalLabel) {
    internalLabel = children
  }
  // Redis-UI badge accepts `string` as label, however in implementation it just renders it out, so any valid node will work
  return <Badge {...rest} label={internalLabel as string} />
}

export type { BadgeVariants }
