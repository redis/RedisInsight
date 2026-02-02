import styled from 'styled-components'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const Wrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;

  .defaultLink {
    color: ${({ theme }: { theme: Theme }) =>
      theme.semantic.color.text.primary500};
  }
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

export const StartSessionBtn = styled.span`
  width: 24px;

  &:disabled {
    opacity: 0.5;
  }
`

export const IconTelescope = styled.span`
  width: 80px;
  height: 60px;
  margin-left: 12px;
  transform: rotateY(180deg);
`
