import React from 'react'
import { format } from 'date-fns'
import parse from 'html-react-parser'

import { NOTIFICATION_DATE_FORMAT } from 'uiSrc/constants/notifications'
import { IGlobalNotification } from 'uiSrc/slices/interfaces'
import { truncateText } from 'uiSrc/utils'

import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { type TitleSize, Title, Text } from 'uiSrc/components/base/text'
import { Spacer } from 'uiSrc/components/base/layout'

import * as S from '../NotificationsCenter.styles'

export interface Props {
  notification: IGlobalNotification
  titleSize?: TitleSize
}

const Notification = (props: Props) => {
  const { notification, titleSize = 'XS' } = props

  return (
    <>
      <S.NotificationTitle>
        <Title size={titleSize} data-testid="notification-title">
          {notification.title}
        </Title>
      </S.NotificationTitle>
      <Spacer size="s" />
      <S.NotificationBody>
        <Text
          component="div"
          size="s"
          className="notificationHTMLBody"
          data-testid="notification-body"
        >
          {parse(notification.body)}
        </Text>
      </S.NotificationBody>

      <S.NotificationFooter align="center" justify="start">
        <FlexItem>
          <Text size="xs" data-testid="notification-date">
            {format(notification.timestamp * 1000, NOTIFICATION_DATE_FORMAT)}
          </Text>
        </FlexItem>
        {notification.category && (
          <FlexItem>
            <S.Category
              style={{ backgroundColor: notification.categoryColor ?? '#666' }}
              data-testid="notification-category"
            >
              {truncateText(notification.category, 32)}
            </S.Category>
          </FlexItem>
        )}
      </S.NotificationFooter>
    </>
  )
}

export default Notification
