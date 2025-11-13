import React from 'react'
import { Banner } from '@redis-ui/components'

export type CallOutProps = Omit<React.ComponentProps<typeof Banner>, 'show'> & {
  children: React.ReactNode
}

export const CallOut = ({ children, ...rest }: CallOutProps) => (
  <Banner
    {...rest}
    show
    showIcon={false}
    layoutVariant="banner"
    message={children}
  />
)
