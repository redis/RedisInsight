import React from 'react'

import { Col } from 'uiSrc/components/base/layout/flex'

import { MessageProps } from './Message.types'
import * as S from './Message.styles'

export const Message = ({
  title,
  children,
  variant = 'notice',
}: MessageProps) => (
  <S.StyledBanner variant={variant} role="status">
    <Col gap="s">
      {title && <strong>{title}</strong>}
      {children}
    </Col>
  </S.StyledBanner>
)
