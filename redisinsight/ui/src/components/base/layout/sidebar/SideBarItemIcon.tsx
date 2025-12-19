import React from 'react'

import { iconWithoutCustomColor } from 'uiSrc/components/base/icons'
import { RiSideBarItemIconProps, StyledIcon } from './sidebar-item-icon.styles'

export const SideBarItemIcon = ({ centered, icon, ...props }: RiSideBarItemIconProps) => (
  <StyledIcon {...props} icon={iconWithoutCustomColor(icon)} $centered={centered} />
)
