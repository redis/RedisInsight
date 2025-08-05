import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  notificationCenterSelector,
  setIsCenterOpen,
} from 'uiSrc/slices/app/notifications'
import { NotificationsIcon } from 'uiSrc/components/base/icons'
import {
  RiSideBarItem,
  SideBarItemIcon,
} from 'uiSrc/components/base/layout/sidebar'
import NotificationCenter from './NotificationCenter'
import PopoverNotification from './PopoverNotification'

import styles from './styles.module.scss'

const NavButton = () => {
  const { isCenterOpen, totalUnread } = useSelector(notificationCenterSelector)

  const dispatch = useDispatch()

  const onClickIcon = () => {
    dispatch(setIsCenterOpen())
  }

  const Btn = (
    <RiSideBarItem
      tooltipProps={{ text: 'Notification Center', placement: 'right' }}
      onMouseDownCapture={onClickIcon}
      isActive={isCenterOpen}
    >
      <SideBarItemIcon
        icon={NotificationsIcon}
        aria-label="Notification Menu"
        data-testid="notification-menu-button"
      />
    </RiSideBarItem>
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
