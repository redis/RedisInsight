import { v4 as uuidv4 } from 'uuid'
import {
  AiChatMessage,
  AiChatMessageType,
} from 'uiSrc/slices/interfaces/aiAssistant'

export const generateHumanMessage = (message: string): AiChatMessage => ({
  id: `ai_${uuidv4()}`,
  type: AiChatMessageType.HumanMessage,
  content: message,
  context: {},
})

export const generateAiMessage = (message = ''): AiChatMessage => ({
  id: `ai_${uuidv4()}`,
  type: AiChatMessageType.AIMessage,
  content: message,
})
