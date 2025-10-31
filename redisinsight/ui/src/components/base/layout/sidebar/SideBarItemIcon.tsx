import React from 'react'

import { RiSideBarItemIconProps, StyledIcon } from './sidebar-item-icon.styles'

export const SideBarItemIcon = ({
  centered,
  ...props
}: RiSideBarItemIconProps) => <StyledIcon {...props} $centered={centered} />
