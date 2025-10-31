import React, { useEffect, useRef } from 'react'

import { useInfiniteNotifications } from 'uiSrc/components/notifications/hooks'
import { riToast, RiToaster } from 'uiSrc/components/base/display/toast'
import { InfiniteMessage } from 'uiSrc/slices/interfaces'
import { IMContainerId, ONE_HOUR } from '../../constants'

const DISMISS_DELAY = 3000 // 3 seconds interval

const showNotification = (notification: InfiniteMessage) => {
  if (!notification) {
    return
  }

  // Show latest notification
  return riToast(notification, {
    containerId: IMContainerId,
  })
}

export const InfiniteNotifications = () => {
  const notifications = useInfiniteNotifications()
  const queueRef = useRef<ReturnType<typeof riToast>[]>([])
  const dismissIntervalRef = useRef<number | null>(null)

  const dismissFromQueue = () => {
    if (queueRef.current.length > 0) {
      const toastToRemove = queueRef.current.shift() // Remove from top of queue
      if (toastToRemove) {
        riToast.dismiss(toastToRemove)
      }
    }
  }

  const startDismissInterval = () => {
    if (dismissIntervalRef.current) {
      clearInterval(dismissIntervalRef.current)
    }

    dismissIntervalRef.current = window.setInterval(() => {
      if (queueRef.current.length > 1) {
        dismissFromQueue()
      } else {
        // Stop interval when queue has 1 or fewer items
        if (dismissIntervalRef.current) {
          clearInterval(dismissIntervalRef.current)
          dismissIntervalRef.current = null
        }
      }
    }, DISMISS_DELAY)
  }

  const addToQueue = (toastId: ReturnType<typeof riToast>) => {
    queueRef.current.push(toastId) // Add to end of queue
  }

  const renderNotification = (notification: InfiniteMessage) => {
    const toastId = showNotification(notification)
    if (toastId) {
      addToQueue(toastId)
    }
  }

  useEffect(() => {
    if (notifications.length > 0) {
      // Process each notification and add to queue
      notifications.forEach((notification) => {
        renderNotification(notification)
      })
    }
    // Start interval if queue has more than 1 item
    if (queueRef.current.length > 1) {
      startDismissInterval()
    }

    // Cleanup on unmount
    return () => {
      if (dismissIntervalRef.current) {
        clearInterval(dismissIntervalRef.current)
        dismissIntervalRef.current = null
      }
    }
  }, [notifications])

  return (
    <RiToaster
      limit={1}
      containerId={IMContainerId}
      autoClose={ONE_HOUR}
      closeOnClick={false}
    />
  )
}
