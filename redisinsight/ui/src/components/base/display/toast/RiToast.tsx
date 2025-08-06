import React from 'react'
import {
  Toast,
  toast,
  ToastContentParams,
  ToastOptions,
} from '@redis-ui/components'
import styled from 'styled-components'
import { CommonProps, Theme } from 'uiSrc/components/base/theme/types'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { ColorText } from 'uiSrc/components/base/text'

type RiToastProps = React.ComponentProps<typeof Toast>
export const RiToast = (props: RiToastProps) => <Toast {...props} />

const StyledMessage = styled.div<{ theme: Theme }>`
  margin-bottom: ${({ theme }) => theme.core.space.space100};
`

type RiToastType = ToastContentParams &
  CommonProps & {
    onClose?: VoidFunction
  }
export const riToast = (
  { onClose, actions, message, ...content }: RiToastType,
  options?: ToastOptions | undefined,
) => {
  const toastContent: ToastContentParams = {
    ...content,
  }

  if (typeof message === 'string') {
    let color = options?.variant
    if (color === 'informative') {
      // @ts-ignore
      color = 'subdued'
    }
    toastContent.message = (
      <ColorText color={color}>
        <StyledMessage>{message}</StyledMessage>
      </ColorText>
    )
  } else {
    toastContent.message = message
  }

  if (onClose) {
    toastContent.showCloseButton = false
    toastContent.actions = {
      ...actions,
      secondary: {
        label: '',
        icon: CancelIcon,
        closes: true,
        onClick: onClose,
      },
    }
  }
  if (actions && !onClose) {
    toastContent.showCloseButton = false
    toastContent.actions = actions
  }
  const toastOptions: ToastOptions = {
    ...options,
    delay: 100,
    closeOnClick: false,
  }
  return toast(<RiToast {...toastContent} />, toastOptions)
}
riToast.Variant = toast.Variant
riToast.Position = toast.Position
riToast.dismiss = toast.dismiss
