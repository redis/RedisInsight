import { fireEvent } from '@testing-library/react'
import { cloneDeep } from 'lodash'
import React from 'react'
import { setIsNotificationOpen } from 'uiSrc/slices/app/notifications'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import PopoverNotification from './PopoverNotification'

jest.mock('uiSrc/slices/app/notifications', () => ({
  ...jest.requireActual('uiSrc/slices/app/notifications'),
  notificationCenterSelector: jest.fn().mockReturnValue({
    isNotificationOpen: true,
    isCenterOpen: false,
    lastReceivedNotification: {
      timestamp: 123123125,
      title: 'string',
      body: 'string',
      read: false,
    },
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('PopoverNotification', () => {
  it('should render', () => {
    expect(render(<PopoverNotification />)).toBeTruthy()
  })

  it('should show notification message', async () => {
    render(<PopoverNotification />)

    expect(screen.getByTestId('notification-popover')).toBeInTheDocument()
  })

  it('should close notification after click close btn', async () => {
    render(<PopoverNotification />)

    fireEvent.click(screen.getByTestId('close-notification-btn'))

    const expectedActions = [setIsNotificationOpen(false)]
    expect(store.getActions()).toEqual(expectedActions)
  })
})
