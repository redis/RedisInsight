import React from 'react'
import { TextButton } from '@redis-ui/components'
import { ButtonIcon } from 'uiSrc/components/base/forms/buttons/Button'
import { EmptyButtonProps } from './EmptyButton.types'
import { Row } from '../../layout/flex'

export const EmptyButton = ({
  children,
  icon,
  iconSide = 'left',
  loading,
  size = 'small',
  justify = 'center',
  ...rest
}: EmptyButtonProps) => (
  <TextButton {...rest} size={size !== 'large' ? 'M' : undefined}>
    {icon ? (
      <Row justify={justify} gap="m" align="center">
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
    ) : (
      children
    )}
  </TextButton>
)
