import React from 'react'
import { Button } from '@redis-ui/components'
import { IconType } from 'uiSrc/components/base/icons'

type RedisUiButtonProps = React.ComponentProps<typeof Button>
export type BaseButtonProps = Omit<RedisUiButtonProps, 'size'> & {
  icon?: IconType
  iconSide?: 'left' | 'right'
  loading?: boolean
  size?: RedisUiButtonProps['size'] | 's' | 'm' | 'l'
}
export type ButtonProps = Omit<BaseButtonProps, 'variant'>
export type SecondaryButtonProps = ButtonProps & {
  filled?: boolean
  inverted?: boolean
}
