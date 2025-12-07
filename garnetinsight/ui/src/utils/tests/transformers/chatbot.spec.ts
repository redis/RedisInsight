import {
  generateHumanMessage,
  generateAiMessage,
} from 'uiSrc/utils/transformers/chatbot'
import { AiChatMessageType } from 'uiSrc/slices/interfaces/aiAssistant'

describe('generateHumanMessage', () => {
  it('should properly return human message object', () => {
    expect(generateHumanMessage('hello')).toEqual({
      id: expect.any(String),
      type: AiChatMessageType.HumanMessage,
      content: 'hello',
      context: {},
    })
  })
})

describe('generateAiMessage', () => {
  it('should properly return human message object', () => {
    expect(generateAiMessage('hello')).toEqual({
      id: expect.any(String),
      type: AiChatMessageType.AIMessage,
      content: 'hello',
    })
  })
})
