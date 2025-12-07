import React from 'react'
import {
  Toast,
  toast,
  ToastContentParams,
  ToastOptions,
} from '@redis-ui/components'
import { ToastOptions as RcToastOptions } from 'react-toastify'

import { CommonProps } from 'uiSrc/components/base/theme/types'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { ColorType } from 'uiSrc/components/base/text/text.styles'

type RiToastProps = React.ComponentProps<typeof Toast>
export const RiToast = (props: RiToastProps) => <Toast {...props} />

export type RiToastType = ToastContentParams &
  CommonProps & {
    onClose?: VoidFunction
  }
export const riToast = (
  { onClose, message, ...content }: RiToastType,
  options?: ToastOptions | undefined,
) => {
  const toastContent: ToastContentParams = {
    ...content,
  }

  if (typeof message === 'string') {
    let color: ColorType = options?.variant
    if (color === 'informative') {
      color = 'subdued'
    }
    toastContent.message = (
      <Text size="M" variant="semiBold">
        <ColorText color={color}>{message}</ColorText>
      </Text>
    )
  } else {
    toastContent.message = message
  }

  const toastOptions: ToastOptions & RcToastOptions = {
    ...options,
    delay: 100,
    closeOnClick: false,
    onClose,
  }
  return toast(<RiToast {...toastContent} />, toastOptions)
}
riToast.Variant = toast.Variant
riToast.Position = toast.Position
riToast.dismiss = toast.dismiss
riToast.isActive = toast.isActive
