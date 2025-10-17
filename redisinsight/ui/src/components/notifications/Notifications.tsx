import React from 'react'
import { RiToaster } from 'uiSrc/components/base/display/toast'
import {
  useErrorNotifications,
  useMessageNotifications,
  useInfiniteNotifications,
} from './hooks'

const Notifications = () => {
  useErrorNotifications()
  useMessageNotifications()
  useInfiniteNotifications()

  return <RiToaster />
}

export default Notifications
