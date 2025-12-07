import React from 'react'
import { mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'

import {
  AiChatMessage,
  AiChatMessageType,
} from 'uiSrc/slices/interfaces/aiAssistant'
import ChatHistory, { Props } from './ChatHistory'

const mockedProps = mock<Props>()

const history: AiChatMessage[] = [
  {
    content: '1',
    type: AiChatMessageType.HumanMessage,
    id: '1',
  },
  {
    content: '2',
    type: AiChatMessageType.AIMessage,
    id: '2',
  },
  {
    content: '3',
    type: AiChatMessageType.HumanMessage,
    id: '3',
  },
  {
    content: '4',
    type: AiChatMessageType.AIMessage,
    id: '4',
  },
]

describe('ChatHistory', () => {
  it('should render', () => {
    expect(render(<ChatHistory {...mockedProps} />)).toBeTruthy()
  })

  it('should render intial chat message', () => {
    render(
      <ChatHistory
        {...mockedProps}
        history={[]}
        initialMessage={<div data-testid="initial-message" />}
      />,
    )

    expect(screen.getByTestId('initial-message')).toBeInTheDocument()
  })

  it('should render loading answer indicator', () => {
    render(
      <ChatHistory
        {...mockedProps}
        history={history}
        inProgressMessage={{ content: '' } as any}
      />,
    )

    expect(screen.getByTestId('ai-loading-answer')).toBeInTheDocument()
  })

  it('should render history', () => {
    render(<ChatHistory {...mockedProps} history={history} />)

    history.forEach(({ id, type }) => {
      expect(screen.getByTestId(`ai-message-${type}_${id}`)).toBeInTheDocument()
    })
  })
})
