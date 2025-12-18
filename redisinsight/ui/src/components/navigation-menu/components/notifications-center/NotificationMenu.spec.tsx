import { fireEvent } from '@testing-library/react'
import { cloneDeep } from 'lodash'
import React from 'react'
import {
  notificationCenterSelector,
  setIsCenterOpen,
} from 'uiSrc/slices/app/notifications'
import { cleanup, mockedStore, render, screen } from 'uiSrc/utils/test-utils'
import { SideBar } from 'uiSrc/components/base/layout/sidebar'
import NotificationMenu from './NotificationMenu'

jest.mock('uiSrc/slices/app/notifications', () => ({
  ...jest.requireActual('uiSrc/slices/app/notifications'),
  notificationCenterSelector: jest.fn().mockReturnValue({
    notifications: [],
    totalUnread: 1,
    isCenterOpen: false,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const sideBarWithNotificationMenu = (
  <SideBar isExpanded={false}>
    <NotificationMenu />
  </SideBar>
)

describe('NotificationMenu', () => {
  it('should render', () => {
    expect(render(sideBarWithNotificationMenu)).toBeTruthy()
  })

  it('should open notification center onClick icon', async () => {
    render(sideBarWithNotificationMenu)

    fireEvent.mouseDown(screen.getByTestId('notification-menu-button'))

    const expectedActions = [setIsCenterOpen()]
    expect(store.getActions()).toEqual(expectedActions)
  })

  it('should show badge with count of unread messages', async () => {
    render(sideBarWithNotificationMenu)

    expect(screen.getByTestId('total-unread-badge')).toBeInTheDocument()
    expect(screen.getByTestId('total-unread-badge')).toHaveTextContent('1')
  })

  it('should show badge with count 9+ of unread messages', async () => {
    ;(notificationCenterSelector as jest.Mock).mockReturnValueOnce({
      notifications: [],
      totalUnread: 13,
      isCenterOpen: false,
    })
    render(sideBarWithNotificationMenu)

    expect(screen.getByTestId('total-unread-badge')).toHaveTextContent('9+')
  })
})
