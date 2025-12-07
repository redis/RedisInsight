import React from 'react'
import {
  BaseButtonProps,
  SecondaryButtonProps,
} from 'uiSrc/components/base/forms/buttons/button.styles'
import { BaseButton } from 'uiSrc/components/base/forms/buttons/Button'

export const SecondaryButton = ({
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
