import React, { ComponentProps } from 'react'

import { Loader as RedisLoader } from '@redis-ui/components'
import { useTheme, theme } from '@redis-ui/styles'

type Space = typeof theme.core.space

export type RedisLoaderProps = ComponentProps<typeof RedisLoader>

const convertSizeToPx = (tShirtSize: string, space: Space) => {
  switch (tShirtSize.toLowerCase()) {
    case 's':
      return space.space050
    case 'm':
      return space.space100
    case 'l':
      return space.space250
    case 'xl':
      return space.space300
    default:
      return space.space100
  }
}

export const RiLoader = ({ size, ...rest }: RedisLoaderProps) => {
  const theme = useTheme()
  const { space } = theme.core
  const sizeInPx = size ? convertSizeToPx(size, space) : space.space100
  return <RedisLoader size={sizeInPx} {...rest} />
}
