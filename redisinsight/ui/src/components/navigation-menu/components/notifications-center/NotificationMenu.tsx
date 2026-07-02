import React from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import {
  notificationCenterSelector,
  setIsCenterOpen,
} from 'uiSrc/slices/app/notifications'
import { NotificationsIcon } from 'uiSrc/components/base/icons'
import {
  SideBarItem,
  SideBarItemIcon,
} from 'uiSrc/components/base/layout/sidebar'
import NotificationCenter from './NotificationCenter'
import PopoverNotification from './PopoverNotification'

import styles from './styles.module.scss'

const NavButton = () => {
  const { isCenterOpen, totalUnread } = useAppSelector(
    notificationCenterSelector,
  )

  const dispatch = useAppDispatch()

  const onClickIcon = () => {
    dispatch(setIsCenterOpen())
  }

  const Btn = (
    <SideBarItem
      tooltipProps={{ text: 'Notification center', placement: 'right' }}
      onMouseDownCapture={onClickIcon}
      isActive={isCenterOpen}
    >
      <SideBarItemIcon
        icon={NotificationsIcon}
        aria-label="Notification menu"
        data-testid="notification-menu-button"
      />
    </SideBarItem>
  )

  return (
    <>
      {Btn}
      {totalUnread > 0 && !isCenterOpen && (
        <div
          className={styles.badgeUnreadCount}
          data-testid="total-unread-badge"
        >
          {totalUnread > 9 ? '9+' : totalUnread}
        </div>
      )}
    </>
  )
}

const NotificationMenu = () => (
  <div className={styles.wrapper} data-testid="notification-menu">
    <NavButton />
    <NotificationCenter />
    <PopoverNotification />
  </div>
)

export default NotificationMenu
