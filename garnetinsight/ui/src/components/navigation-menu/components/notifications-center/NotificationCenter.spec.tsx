import { within } from '@testing-library/react'
import { format } from 'date-fns'
import { cloneDeep } from 'lodash'
import React from 'react'
import { NOTIFICATION_DATE_FORMAT } from 'uiSrc/constants/notifications'
import { getNotifications } from 'uiSrc/slices/app/notifications'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import NotificationCenter from './NotificationCenter'

const notificationsMock = [
  {
    type: 'global',
    timestamp: 123123125,
    title: 'string',
    body: 'string',
    read: false,
  },
  {
    type: 'global',
    timestamp: 123123124,
    title: 'string1',
    body: 'string1',
    read: false,
  },
  {
    type: 'global',
    timestamp: 123123121,
    title: 'string2',
    body: 'string2',
    read: true,
  },
]

jest.mock('uiSrc/slices/app/notifications', () => ({
  ...jest.requireActual('uiSrc/slices/app/notifications'),
  notificationCenterSelector: jest.fn().mockReturnValue({
    isCenterOpen: true,
    notifications: notificationsMock,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('NotificationCenter', () => {
  it('should render', () => {
    expect(render(<NotificationCenter />)).toBeTruthy()
  })

  it('should render notifications', async () => {
    render(<NotificationCenter />)

    expect(screen.getAllByTestId(/notification-item-/)).toHaveLength(
      notificationsMock.length,
    )
  })

  it('should dispatch get notification', async () => {
    render(<NotificationCenter />)

    const expectedActions = [getNotifications()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should render proper unread notifications', async () => {
    render(<NotificationCenter />)

    expect(screen.getAllByTestId(/notification-item-unread/)).toHaveLength(
      notificationsMock.filter((n) => !n.read).length,
    )
  })

  it('should render proper read notifications', async () => {
    render(<NotificationCenter />)

    expect(screen.getAllByTestId(/notification-item-read/)).toHaveLength(
      notificationsMock.filter((n) => n.read).length,
    )
  })

  it('should render proper notification content', async () => {
    render(<NotificationCenter />)

    notificationsMock.forEach((notification) => {
      const notificationContainer = screen.getByTestId(
        new RegExp(`notification-item-(.*)_${notification.timestamp}`),
      )

      expect(
        within(notificationContainer).getByTestId('notification-title'),
      ).toHaveTextContent(notification.title)

      expect(
        within(notificationContainer).getByTestId('notification-date'),
      ).toHaveTextContent(
        format(notification.timestamp * 1000, NOTIFICATION_DATE_FORMAT),
      )
    })
  })
})
