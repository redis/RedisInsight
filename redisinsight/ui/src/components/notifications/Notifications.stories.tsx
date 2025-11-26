import React, { useEffect, useRef } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'

import Notifications from './Notifications'
import {
  INFINITE_MESSAGES,
  InfiniteMessagesIds,
} from 'uiSrc/components/notifications/components'
import { CloudJobStep } from 'uiSrc/electron/constants'
import { useDispatch } from 'react-redux'
import {
  addInfiniteNotification,
  removeInfiniteNotification,
  addErrorNotification,
  IAddInstanceErrorPayload,
} from 'uiSrc/slices/app/notifications'
import { InfiniteMessage } from 'uiSrc/slices/interfaces'
import { fn } from 'storybook/test'

const meta: Meta<typeof Notifications> = {
  component: Notifications,
  decorators: [
    (Story) => {
      useNotificationUpdates()

      return <Story />
    },
  ],
}
/*
- 10:32:30.550 notifications.ts:168 addInfiniteNotification {id: 'oAuthProgress', variation: 'credentials', message: {…}, description: {…}, customIcon: ƒ}
- 10:32:30.551 notifications.ts:171 addInfiniteNotification add {id: 'oAuthProgress', variation: 'credentials', message: {…}, description: {…}, customIcon: ƒ}
- 10:32:30.572 notifications.ts:168 addInfiniteNotification {id: 'oAuthProgress', variation: undefined, message: {…}, description: {…}, customIcon: ƒ}
- 10:32:30.573 notifications.ts:174 addInfiniteNotification update {id: 'oAuthProgress', variation: undefined, message: {…}, description: {…}, customIcon: ƒ}
- 10:32:32.078 notifications.ts:168 addInfiniteNotification {id: 'oAuthProgress', variation: 'subscription', message: {…}, description: {…}, customIcon: ƒ}
- 10:32:32.079 notifications.ts:174 addInfiniteNotification update {id: 'oAuthProgress', variation: 'subscription', message: {…}, description: {…}, customIcon: ƒ}
- 10:32:34.953 notifications.ts:168 addInfiniteNotification {id: 'subscriptionExists', message: 'Your subscription does not have a free Redis Cloud database.', description: 'Do you want to create a free database in your existing subscription?', actions: {…}, onClose: ƒ}
- 10:32:34.953 notifications.ts:171 addInfiniteNotification add {id: 'subscriptionExists', message: 'Your subscription does not have a free Redis Cloud database.', description: 'Do you want to create a free database in your existing subscription?', actions: {…}, onClose: ƒ}
- 10:32:34.954 notifications.ts:188 removeInfiniteNotification oAuthProgress
- 10:32:34.954 notifications.ts:190 removeInfiniteNotification remove oAuthProgress
- 10:32:34.955 notifications.ts:194 removeInfiniteNotification removed [Proxy(Object)]
- 10:32:38.996 notifications.ts:168 addInfiniteNotification {id: 'subscriptionExists', message: 'Your subscription does not have a free Redis Cloud database.', description: 'Do you want to create a free database in your existing subscription?', actions: {…}, onClose: ƒ}
- 10:32:38.997 notifications.ts:174 addInfiniteNotification update {id: 'subscriptionExists', message: 'Your subscription does not have a free Redis Cloud database.', description: 'Do you want to create a free database in your existing subscription?', actions: {…}, onClose: ƒ}
- 10:32:38.998 notifications.ts:188 removeInfiniteNotification oAuthProgress
- 10:32:49.035 notifications.ts:188 removeInfiniteNotification subscriptionExists
- 10:32:49.035 notifications.ts:190 removeInfiniteNotification remove subscriptionExists
- 10:32:49.035 notifications.ts:194 removeInfiniteNotification removed []
- 10:33:01.764 notifications.ts:188 removeInfiniteNotification subscriptionExists
- 10:33:01.764 notifications.ts:168 addInfiniteNotification {id: 'oAuthProgress', variation: 'credentials', message: {…}, description: {…}, customIcon: ƒ}
- 10:33:01.764 notifications.ts:171 addInfiniteNotification add {id: 'oAuthProgress', variation: 'credentials', message: {…}, description: {…}, customIcon: ƒ}
- 10:33:05.810 notifications.ts:188 removeInfiniteNotification subscriptionExists
- 10:33:18.123 notifications.ts:188 removeInfiniteNotification oAuthProgress
- 10:33:18.123 notifications.ts:190 removeInfiniteNotification remove oAuthProgress
- 10:33:18.123 notifications.ts:194 removeInfiniteNotification removed []
 */
type SampleNotification =
  | { ts: number; type: 'add'; nf: InfiniteMessage }
  | { ts: number; type: 'rm'; nf: string }
  | { ts: number; type: 'error'; error: IAddInstanceErrorPayload }

const sampleNotifications: SampleNotification[] = [
  {
    ts: 0,
    type: 'add',
    nf: INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
  },
  { ts: 20, type: 'add', nf: INFINITE_MESSAGES.AUTHENTICATING() },
  {
    ts: 1500,
    type: 'add',
    nf: INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Subscription),
  },
  {
    ts: 2900,
    type: 'add',
    nf: INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(fn(), fn()),
  },
  { ts: 1, type: 'rm', nf: InfiniteMessagesIds.oAuthProgress },
  {
    ts: 4000,
    type: 'add',
    nf: INFINITE_MESSAGES.SUBSCRIPTION_EXISTS(fn(), fn()),
  },
  { ts: 2, type: 'rm', nf: InfiniteMessagesIds.oAuthProgress },
  { ts: 9000, type: 'rm', nf: InfiniteMessagesIds.subscriptionExists },
  { ts: 10000, type: 'rm', nf: InfiniteMessagesIds.subscriptionExists },
  {
    ts: 1,
    type: 'add',
    nf: INFINITE_MESSAGES.PENDING_CREATE_DB(CloudJobStep.Credentials),
  },
  { ts: 4000, type: 'rm', nf: InfiniteMessagesIds.subscriptionExists },
  {
    ts: 5000,
    type: 'error',
    error: {
      message: 'Something went wrong',
      response: {
        data: {
          message: 'An unexpected error occurred',
          title: 'Error',
        },
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      },
    } as IAddInstanceErrorPayload,
  },
  { ts: 13000, type: 'rm', nf: InfiniteMessagesIds.oAuthProgress },
]

const useNotificationUpdates = () => {
  const dispatch = useDispatch()
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])

  useEffect(() => {
    let cumulativeTime = 0

    sampleNotifications.forEach((notification) => {
      cumulativeTime += notification.ts

      const timeoutId = setTimeout(() => {
        if (notification.type === 'add') {
          dispatch(addInfiniteNotification(notification.nf))
        } else if (notification.type === 'rm') {
          dispatch(removeInfiniteNotification(notification.nf))
        } else if (notification.type === 'error') {
          dispatch(addErrorNotification(notification.error))
        }
      }, cumulativeTime)

      timeoutRefs.current.push(timeoutId)
    })

    return () => {
      timeoutRefs.current.forEach((timeoutId) => {
        clearTimeout(timeoutId)
      })
      timeoutRefs.current = []
    }
  }, [dispatch])
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
