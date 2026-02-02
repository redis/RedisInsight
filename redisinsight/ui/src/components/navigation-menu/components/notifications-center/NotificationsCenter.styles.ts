import styled, { css } from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'
import { type Theme } from 'uiSrc/components/base/theme/types'
import { Title } from 'uiSrc/components/base/text/Title'

export const Wrapper = styled.div`
  position: relative;
  display: flex;
`

export const BadgeUnreadCount = styled.span`
  position: absolute;
  top: 8px;
  right: 10px;
  width: 16px;
  height: 16px;
  border-radius: 22px;
  background: #8ba2ff;
  text-align: center;
  line-height: 15px;
  font-size: 10px;
  color: #000;
`

export const POPOVER_MIN_WIDTH = '420px'

export const PopoverAnchor = styled.div``

export const NoItemsText = styled.div`
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-items: center;
  align-self: center;
`

export const PopoverNotificationCenter = styled.div`
  display: flex;
  flex-direction: column;
`

export const CenterTitle = styled(Title)`
  padding: 6px 15px 0;
`

export const NotificationsList = styled.div`
  margin-top: 18px;
  max-height: 70vh;
  scrollbar-width: thin;
  overflow: auto;
  padding: 0 15px 0;
  margin-bottom: 12px;
`

export const NotificationItem = styled.div<{ $unread?: boolean }>`
  position: relative;

  ${({ $unread, theme }) =>
    $unread &&
    css`
      &:before {
        display: block;
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: ${(theme as Theme).semantic.color.background
          .primary500};
        position: absolute;
        top: 8px;
        left: -14px;
      }
    `}

  &:not(:last-child) {
    margin-bottom: 24px;
  }
`

export const NotificationTitle = styled.span`
  margin-bottom: 6px;
  font-weight: normal;
  display: inline-block;
`

export const NotificationFooter = styled(Row)`
  margin-top: 6px;
`

export const Category = styled.span`
  margin-left: 12px;
  border: 0;
  color: #dfe5ef;
  background-color: #666;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
`

// PopoverNotification styles
export const PopoverNotification = styled.div`
  padding: 6px 15px;
  position: relative;
`

export const CloseBtn = styled.span`
  position: absolute;
  top: 8px;
  right: 8px;
`

export const PopoverNotificationTitle = styled.span`
  display: block;
  margin-right: 30px;
  margin-bottom: 12px;
  font:
    normal normal 500 18px/24px Graphik,
    sans-serif;
`

export const NotificationDate = styled.span`
  margin-top: 6px;
`

export const NotificationBody = styled.div``
