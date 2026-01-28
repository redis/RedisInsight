import styled from 'styled-components'
import { HTMLAttributes } from 'react'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'

export const Page = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

export const ContentWrapper = styled(Row)`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  border-bottom-width: 0;
`

export const Content = styled(Col)`
  min-height: 100%;
  height: 1px;
  width: 100%;
  position: relative;
  padding: 24px 18px 96px 18px;
  scroll-padding-bottom: 80px;

  @media screen and (max-width: 767px) {
    scroll-padding-bottom: 96px;
  }
`

export const ScrollContainer = styled.div`
  scroll-padding-bottom: 60px;
  margin: 0 -16px;
  padding: 0 16px;
`

export const ContentFields = styled.div`
  max-width: 680px;
  margin: 0 auto;
  width: 100%;
`

export const HelpText = styled.span<HTMLAttributes<HTMLSpanElement>>`
  color: ${({ theme }) => theme.semantic.color.text.secondary};
  display: block;
  margin-bottom: ${({ theme }) => theme.core.space.space150};
  font-size: 14px;
  line-height: 24px;
`

export const CloseKeyTooltip = styled.div`
  position: absolute;
  top: 22px;
  right: 18px;
`

export const CloseBtn = styled(IconButton)`
  svg {
    width: 20px;
    height: 20px;
  }
`
