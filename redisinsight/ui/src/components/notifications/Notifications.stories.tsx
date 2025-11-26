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
/* Captured some logs of sequence of notifications for testing purposes, simulated here with setTimeout */
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
