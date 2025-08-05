import React from 'react'
import { ButtonProps } from './button.styles'
import { BaseButton } from './Button'

export const RiDestructiveButton = (props: ButtonProps) => (
  <BaseButton {...props} variant="destructive" />
)
