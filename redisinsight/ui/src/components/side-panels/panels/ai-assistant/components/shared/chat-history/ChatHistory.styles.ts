import styled from 'styled-components'
import { AiChatMessageType } from 'uiSrc/slices/interfaces/aiAssistant'

export const MessageContainer = styled.div<{
  messageType: AiChatMessageType
  hasError: boolean
}>`
  overflow-wrap: break-word;
  padding: 8px 16px;
  border-radius: 8px;
  gap: 6px;

  ${({ messageType, theme }) =>
    messageType === AiChatMessageType.AIMessage &&
    `
    background-color: ${theme.components.button.variants.primary.disabled?.bgColor};
  `}

  ${({ messageType, theme }) =>
    messageType === AiChatMessageType.HumanMessage &&
    `
    background-color: ${theme.components.button.variants['secondary-invert'].normal?.bgColor};
    color: ${theme.components.button.variants['secondary-invert'].normal?.textColor};
  `}
  
  ${({ hasError }) =>
    hasError &&
    `
    opacity: .66;
    display: flex;
  `}
`
