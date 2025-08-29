import React from 'react'
import { TextButton } from '@redis-ui/components'
import { ButtonIcon } from 'uiSrc/components/base/forms/buttons/Button'
import { IconType } from 'uiSrc/components/base/icons'
import { Row } from '../../layout/flex'
import { FlexProps } from '../../layout/flex/flex.styles'

export type ButtonProps = React.ComponentProps<typeof TextButton> & {
  icon?: IconType
  iconSide?: 'left' | 'right'
  loading?: boolean
  size?: 'small' | 'large' | 'medium'
  justify?: FlexProps['justify']
}
export const EmptyButton = ({
  children,
  icon,
  iconSide = 'left',
  loading,
  size = 'small',
  justify = 'center',
  ...rest
}: ButtonProps) => (
  <TextButton {...rest}>
    <Row justify={justify} gap="xs">
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
    </Row>
  </TextButton>
)
