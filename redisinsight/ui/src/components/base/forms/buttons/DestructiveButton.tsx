import React from 'react'
import { ButtonProps } from 'uiSrc/components/base/forms/buttons/button.styles'
import { BaseButton } from 'uiSrc/components/base/forms/buttons/Button'

export const DestructiveButton = (props: ButtonProps) => (
  <BaseButton {...props} variant="destructive" />
)
