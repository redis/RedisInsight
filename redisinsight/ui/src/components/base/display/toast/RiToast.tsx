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
import { Spacer } from '../../layout'

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
    let color = options?.variant
    if (color === 'informative') {
      // @ts-ignore
      color = 'subdued'
    }
    toastContent.message = (
      <ColorText color={color}>
        <Text size="M" variant="semiBold">
          {message}
        </Text>
        <Spacer size="s" />
      </ColorText>
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
