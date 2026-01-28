import styled from 'styled-components'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'

export const Container = styled.div`
  flex-grow: 1;
  height: 36px;
  position: relative;
`

export const HiddenText = styled.p`
  display: inline-block;
  visibility: hidden;
  height: 1px;
  overflow: hidden;
  font-size: 15px;
  max-width: 100%;
  margin-left: 40px;
  margin-right: 50px;
  word-break: break-all;
`

export const CloudIcon = styled(RiIcon)`
  width: 14px;
  height: 14px;

  path {
    fill: ${({ theme }) => theme.semantic.color.icon.accent} !important;
  }
`

export const AskCopilotBtn = styled(EmptyButton)`
  margin-left: ${({ theme }) => theme.core.space.space050};
`
