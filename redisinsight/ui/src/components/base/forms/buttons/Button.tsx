import { Button } from '@redis-ui/components'
import React from 'react'
import { LoaderLargeIcon } from 'uiSrc/components/base/icons'
import { BaseButtonProps } from 'uiSrc/components/base/forms/buttons/button.styles'
import { Spacer } from 'uiSrc/components/base/layout'

type ButtonSize = 'small' | 'medium' | 'large'
type SizeKey = 'small' | 's' | 'medium' | 'm' | 'large' | 'l'

const buttonSizeMap: Record<SizeKey, ButtonSize> = {
  small: 'small',
  s: 'small',
  medium: 'medium',
  m: 'medium',
  large: 'large',
  l: 'large',
}
export const BaseButton = ({
  children,
  icon,
  iconSide = 'left',
  loading,
  size = 'medium',
  ...props
}: BaseButtonProps) => {
  let btnSize: ButtonSize = 'medium'

  if (size in buttonSizeMap) {
    btnSize = buttonSizeMap[size]
  }

  return (
    <Button {...props} size={btnSize} disabled={props.disabled || loading}>
      <ButtonIcon
        buttonSide="left"
        icon={icon}
        iconSide={iconSide}
        loading={loading}
        size={btnSize}
      />
      {children}
      <ButtonIcon
        buttonSide="right"
        icon={icon}
        iconSide={iconSide}
        loading={loading}
        size={btnSize}
      />
    </Button>
  )
}

export type ButtonIconProps = Pick<
  BaseButtonProps,
  'icon' | 'iconSide' | 'loading'
> & {
  buttonSide: 'left' | 'right'
  size?: 'small' | 'large' | 'medium'
}
export const IconSizes = {
  small: '16px',
  medium: '20px',
  large: '24px',
}

export const ButtonIcon = ({
  buttonSide,
  icon,
  iconSide,
  loading,
  size,
}: ButtonIconProps) => {
  // if iconSide is not the same as side of the button, don't render
  if (iconSide !== buttonSide) {
    return null
  }
  let renderIcon = icon
  if (loading) {
    renderIcon = LoaderLargeIcon
  }
  if (!renderIcon) {
    return null
  }
  let iconSize: string | undefined
  if (size) {
    iconSize = IconSizes[size]
  }
  const spacer = <Spacer size="s" direction="horizontal" />
  return (
    <>
      {buttonSide === 'right' && spacer}
      <Button.Icon icon={renderIcon} customSize={iconSize} />
      {buttonSide === 'left' && spacer}
    </>
  )
}
