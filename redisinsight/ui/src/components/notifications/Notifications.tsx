import React from 'react'
import { RiToaster } from 'uiSrc/components/base/display/toast'
import { useErrorNotifications, useMessageNotifications } from './hooks'
import { InfiniteNotifications } from './components/infinite-messages/InfiniteNotifications'

const Notifications = () => {
  useErrorNotifications()
  useMessageNotifications()

  return (
    <>
      <InfiniteNotifications />
      <RiToaster containerId={'default'} />
    </>
  )
}

export default Notifications
