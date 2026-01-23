import React from 'react'
import { IconButton as RedisUiIconButton } from '@redis-ui/components'
import * as Icons from 'uiSrc/components/base/icons/iconRegistry'
import { AllIconsType } from 'uiSrc/components/base/icons'
import { IconButtonProps, IconType } from './IconButton.types'

export const IconButton = ({ icon, ...props }: IconButtonProps) => {
  let buttonIcon: IconType
  if (typeof icon === 'string') {
    buttonIcon = Icons[icon as AllIconsType]
  } else {
    buttonIcon = icon
  }
  return <RedisUiIconButton icon={buttonIcon} {...props} />
}
