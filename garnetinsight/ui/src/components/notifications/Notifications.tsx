import React from 'react'
import { RiToaster } from 'uiSrc/components/base/display/toast'
import { useErrorNotifications, useMessageNotifications } from './hooks'
import { useInfiniteNotifications } from './hooks/useInfiniteNotifications'
import { defaultContainerId } from './constants'

const Notifications = () => {
  useErrorNotifications()
  useMessageNotifications()
  useInfiniteNotifications()
  return <RiToaster containerId={defaultContainerId} />
}

export default Notifications
