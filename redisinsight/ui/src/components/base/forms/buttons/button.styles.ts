import React from 'react'
import { Button, TextButton, TextButtonProps } from '@redis-ui/components'
import {
  ButtonSizes,
  buttonSizes,
} from '@redis-ui/components/dist/Button/Button.types'
import { IconType } from 'uiSrc/components/base/icons'
import { Theme } from '@redis-ui/styles'
import styled from 'styled-components'

export type BaseButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  'size'
> & {
  icon?: IconType
  iconSide?: 'left' | 'right'
  loading?: boolean
  size?: (typeof buttonSizes)[number] | 's' | 'm' | 'l'
}
export type ButtonProps = Omit<BaseButtonProps, 'variant'>
export type SecondaryButtonProps = ButtonProps & {
  filled?: boolean
  inverted?: boolean
}

const getButtonSizeProps = ({
  theme,
  size = 'small',
}: TextButtonProps & { theme: Theme; size?: ButtonSizes }) =>
  theme.components.button.sizes[size]

export const StyledTextButton = styled(TextButton)<
  TextButtonProps & { size?: ButtonSizes }
>`
  border-radius: ${({ theme, size }) =>
    getButtonSizeProps({ theme, size }).borderRadius};
  padding: ${({ theme, size }) => getButtonSizeProps({ theme, size }).padding};
  height: ${({ theme, size }) => getButtonSizeProps({ theme, size }).height};
  line-height: ${({ theme, size }) =>
    getButtonSizeProps({ theme, size }).lineHeight};
`
