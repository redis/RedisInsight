import React from 'react'
import { BaseButton } from 'uiSrc/components/base/forms/buttons/Button'
import { ButtonProps } from 'uiSrc/components/base/forms/buttons/button.styles'

export const PrimaryButton = (props: ButtonProps) => (
  <BaseButton {...props} variant="primary" />
)
