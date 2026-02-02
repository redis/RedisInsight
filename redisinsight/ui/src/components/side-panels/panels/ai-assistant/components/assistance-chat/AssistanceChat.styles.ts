import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`

export const Header = styled.div`
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral200};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
`

export const ChatHistory = styled.div`
  flex-grow: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`

export const ChatForm = styled.div`
  flex-shrink: 0;
  padding: 0 12px 12px;
`

export const HeaderBtn = styled.span`
  width: 24px;

  &:disabled {
    opacity: 0.5;
  }
`
