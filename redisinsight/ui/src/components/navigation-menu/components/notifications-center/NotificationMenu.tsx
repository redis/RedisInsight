import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

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

import * as S from './NotificationsCenter.styles'

const NavButton = () => {
  const { isCenterOpen, totalUnread } = useSelector(notificationCenterSelector)

  const dispatch = useDispatch()

  const onClickIcon = () => {
    dispatch(setIsCenterOpen())
  }

  const Btn = (
    <SideBarItem
      tooltipProps={{ text: 'Notification Center', placement: 'right' }}
      onMouseDownCapture={onClickIcon}
      isActive={isCenterOpen}
    >
      <SideBarItemIcon
        icon={NotificationsIcon}
        aria-label="Notification Menu"
        data-testid="notification-menu-button"
      />
    </SideBarItem>
  )

  return (
    <>
      {Btn}
      {totalUnread > 0 && !isCenterOpen && (
        <S.BadgeUnreadCount data-testid="total-unread-badge">
          {totalUnread > 9 ? '9+' : totalUnread}
        </S.BadgeUnreadCount>
      )}
    </>
  )
}

const NotificationMenu = () => (
  <S.Wrapper data-testid="notification-menu">
    <NavButton />
    <NotificationCenter />
    <PopoverNotification />
  </S.Wrapper>
)

export default NotificationMenu
