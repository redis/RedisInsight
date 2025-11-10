import React, { useEffect } from 'react'
import { riToast, RiToaster } from 'uiSrc/components/base/display/toast'
import { ONE_HOUR } from 'uiSrc/components/notifications/constants'

export interface Props {
  children?: React.ReactElement
  opened: boolean
  variant?: 'success' | 'attention'
}

export const MessageBar = ({
  children,
  opened,
  variant = 'success',
}: Props) => {
  useEffect(() => {
    if (!opened) {
      return
    }
    riToast(
      {
        message: children,
      },
      {
        // @ts-ignore
        className: variant,
        variant,
        containerId: 'autodiscovery-message-bar',
      },
    )
  }, [opened])

  return (
    <RiToaster
      data-testid="autodiscovery-message-bar"
      containerId="autodiscovery-message-bar"
      autoClose={ONE_HOUR}
      position="top-center"
    />
  )
}

export default MessageBar
