import styled from 'styled-components'
import { HTMLAttributes } from 'react'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { ColorText } from 'uiSrc/components/base/text'

export const Page = styled(Col)`
  height: 100%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.globals.body.bgColor};
`

export const ContentWrapper = styled(Col)`
  border-bottom-width: 0;
  position: relative;
`

export const Content = styled(Col)`
  min-height: 100%;
  height: ${({ theme }) => theme.core.space.space010};
  width: 100%;
  position: relative;
  padding: ${({ theme }) => theme.core.space.space300}
    ${({ theme }) => theme.core.space.space200} 96px
    ${({ theme }) => theme.core.space.space200};
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
  margin: 0 -${({ theme }) => theme.core.space.space200};
  padding: 0 ${({ theme }) => theme.core.space.space200};
`

export const ContentFields = styled.div`
  max-width: 680px;
  margin: 0 auto;
  width: 100%;
`

export const HelpText = styled(ColorText)`
  display: block;
  margin-bottom: ${({ theme }) => theme.core.space.space150};
`

export const CloseKeyTooltip = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.core.space.space250};
  right: ${({ theme }) => theme.core.space.space200};
`
export const FormFooter = styled.div<HTMLAttributes<HTMLDivElement>>`
  position: absolute;
  bottom: 0;
  border: 0 solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-top-width: ${({ theme }) => theme.core.space.space010};
  width: 100%;

  z-index: 2;

  max-height: 100%;
  overflow-y: auto;
`

export const CloseBtn = styled(IconButton)`
  svg {
    width: ${({ theme }) => theme.core.space.space250};
    height: ${({ theme }) => theme.core.space.space250};
  }
`
