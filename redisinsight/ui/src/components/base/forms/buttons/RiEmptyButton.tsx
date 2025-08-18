import React from 'react'
import { TextButton } from '@redis-ui/components'
import { IconType } from 'uiBase/icons'

import { RiRow } from 'uiBase/layout'
import { ButtonIcon } from './Button'
import { FlexProps } from '../../layout/flex/flex.styles'

export type ButtonProps = React.ComponentProps<typeof TextButton> & {
  icon?: IconType
  iconSide?: 'left' | 'right'
  loading?: boolean
  size?: 'small' | 'large' | 'medium'
  justify?: FlexProps['justify']
}
export const RiEmptyButton = ({
  children,
  icon,
  iconSide = 'left',
  loading,
  size = 'small',
  justify = 'center',
  ...rest
}: ButtonProps) => (
  <TextButton {...rest}>
    <RiRow justify={justify}>
      <ButtonIcon
        buttonSide="left"
        icon={icon}
        iconSide={iconSide}
        loading={loading}
        size={size}
      />
      {children}
      <ButtonIcon
        buttonSide="right"
        icon={icon}
        iconSide={iconSide}
        loading={loading}
        size={size}
      />
    </RiRow>
  </TextButton>
)
