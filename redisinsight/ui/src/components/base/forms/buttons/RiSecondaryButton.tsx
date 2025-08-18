import React from 'react'
import { BaseButtonProps, SecondaryButtonProps } from './button.styles'
import { BaseButton } from './Button'

export const RiSecondaryButton = ({
  filled = false,
  inverted,
  ...props
}: SecondaryButtonProps) => {
  let variant: BaseButtonProps['variant'] = 'secondary-fill'

  if (filled === false) {
    variant = 'secondary-ghost'
  }
  if (inverted === true) {
    variant = 'secondary-invert'
  }
  return <BaseButton {...props} variant={variant} />
}
