import React from 'react'
import { IconButton as RedisUiIconButton } from '@redis-ui/components'

export type ButtonProps = React.ComponentProps<typeof RedisUiIconButton>

export type IconType = ButtonProps['icon']
export type IconButtonProps = Omit<ButtonProps, 'icon'> & {
  icon: IconType | string
}
