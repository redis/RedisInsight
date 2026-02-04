import styled from 'styled-components'
import { HTMLAttributes } from 'react'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { ColorText } from 'uiSrc/components/base/text'

export const Page = styled(Col)`
  height: 100%;
  overflow: hidden;
`

export const ContentWrapper = styled(Col)`
  border-bottom-width: 0;
  position: relative;
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

export const ContentHeader = styled(FlexItem)`
  margin-bottom: ${({ theme }) => theme.core.space.space400};
`

export const ScrollContainer = styled(FlexItem)`
  scroll-padding-bottom: 60px;
  margin: 0 -16px;
  padding: 0 16px;
`

export const ContentFields = styled.div`
  max-width: 680px;
  margin: 0 auto;
  width: 100%;
`

export const HelpText = styled(ColorText)`
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
export const FormFooter = styled.div<HTMLAttributes<HTMLDivElement>>`
  position: absolute;
  bottom: 0;
  border: 0 solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-top-width: 1px;
  width: 100%;

  z-index: 2;

  max-height: 100%;
  overflow-y: auto;
`

export const CloseBtn = styled(IconButton)`
  svg {
    width: 20px;
    height: 20px;
  }
`
