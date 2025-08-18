import React from 'react'
import { IconButton as RedisUiIconButton } from '@redis-ui/components'
import * as Icons from 'uiBase/icons/iconRegistry'
import { AllIconsType } from 'uiBase/icons'

export type ButtonProps = React.ComponentProps<typeof RedisUiIconButton>

export type IconType = ButtonProps['icon']
export type IconButtonProps = Omit<ButtonProps, 'icon'> & {
  icon: IconType | string
}

export const RiIconButton = ({ icon, size, ...props }: IconButtonProps) => {
  let buttonIcon: IconType
  if (typeof icon === 'string') {
    buttonIcon = Icons[icon as AllIconsType]
  } else {
    buttonIcon = icon
  }
  return <RedisUiIconButton icon={buttonIcon} {...props} />
}
