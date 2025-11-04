import React from 'react'
import { cloneDeep } from 'lodash'
import {
  act,
  cleanup,
  expectActionsToContain,
  fireEvent,
  mockedStore,
  mockedStoreFn,
  render,
  screen,
  waitForRiPopoverVisible,
} from 'uiSrc/utils/test-utils'

import {
  aiAssistantChatSelector,
  createAssistantChat,
  getAssistantChatHistory,
  removeAssistantChatHistory,
  sendQuestion,
  updateAssistantChatAgreements,
} from 'uiSrc/slices/panels/aiAssistant'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import AssistanceChat from './AssistanceChat'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/panels/aiAssistant', () => ({
  ...jest.requireActual('uiSrc/slices/panels/aiAssistant'),
  aiAssistantChatSelector: jest.fn().mockReturnValue({
    id: '',
    messages: [],
    agreements: true,
  }),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStoreFn())
  store.clearActions()
})

describe('AssistanceChat', () => {
  it('should render', () => {
    expect(render(<AssistanceChat />, { store })).toBeTruthy()
  })

  it('should proper components render by default', () => {
    render(<AssistanceChat />, { store })

    expect(
      screen.getByTestId('ai-general-restart-session-btn'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('ai-chat-empty-history')).toBeInTheDocument()
    expect(screen.getByTestId('ai-submit-message-btn')).toBeInTheDocument()
  })

  it('should call proper actions by default', () => {
    render(<AssistanceChat />, { store })

    expect(store.getActions()).toEqual([])
  })

  it('should get history', () => {
    ;(aiAssistantChatSelector as jest.Mock).mockReturnValue({
      id: '1',
      messages: [],
      agreements: true,
    })
    render(<AssistanceChat />, { store })

    expect(store.getActions()).toEqual([getAssistantChatHistory()])
  })

  it('should call action to create an id after submit first message', () => {
    ;(aiAssistantChatSelector as jest.Mock).mockReturnValue({
      id: '',
      messages: [],
      agreements: true,
    })
    render(<AssistanceChat />, { store })

    act(() => {
      fireEvent.change(screen.getByTestId('ai-message-textarea'), {
        target: { value: 'test' },
      })
    })

    fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

    expect(store.getActions()).toEqual([createAssistantChat()])
  })

  it('should call action after submit message', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(aiAssistantChatSelector as jest.Mock).mockReturnValue({
      id: '1',
      messages: [],
      agreements: true,
    })
    render(<AssistanceChat />, { store })

    const afterRenderActions = [...store.getActions()]

    act(() => {
      fireEvent.change(screen.getByTestId('ai-message-textarea'), {
        target: { value: 'test' },
      })
    })

    fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      sendQuestion(expect.objectContaining({ content: 'test' })),
    ])

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.AI_CHAT_MESSAGE_SENT,
      eventData: {
        chat: AiChatType.Assistance,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should show agreements', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(aiAssistantChatSelector as jest.Mock).mockReturnValue({
      id: '1',
      messages: [],
      agreements: false,
    })
    render(<AssistanceChat />, { store })

    const afterRenderActions = [...store.getActions()]

    act(() => {
      fireEvent.change(screen.getByTestId('ai-message-textarea'), {
        target: { value: 'test' },
      })
    })

    fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

    await waitForRiPopoverVisible()

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.AI_CHAT_BOT_TERMS_DISPLAYED,
      eventData: {
        chat: AiChatType.Assistance,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()

    act(() => {
      fireEvent.click(screen.getByTestId('ai-accept-agreements'))
    })

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.AI_CHAT_BOT_TERMS_ACCEPTED,
      eventData: {
        chat: AiChatType.Assistance,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      updateAssistantChatAgreements(true),
      sendQuestion(expect.objectContaining({ content: 'test' })),
    ])
  })

  it('should call action after click on restart session', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(aiAssistantChatSelector as jest.Mock).mockReturnValue({
      id: '1',
      messages: [{}],
      agreements: true,
    })

    render(<AssistanceChat />, { store })

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('ai-general-restart-session-btn'))

    await waitForRiPopoverVisible()
    await act(async () => {
      fireEvent.click(screen.getByTestId('ai-chat-restart-confirm'))
    })

    expectActionsToContain(store.getActions(), [
      ...afterRenderActions,
      removeAssistantChatHistory(),
    ])

    expect(sendEventTelemetry).toHaveBeenCalledWith({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chat: AiChatType.Assistance,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
