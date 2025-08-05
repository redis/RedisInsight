import React from 'react'
import { BaseButton } from './Button'
import { ButtonProps } from './button.styles'

export const RiPrimaryButton = (props: ButtonProps) => (
  <BaseButton {...props} variant="primary" />
)
