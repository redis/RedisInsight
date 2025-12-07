import React from 'react'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  mockedStore,
  render,
  screen,
  act,
  fireEvent,
} from 'uiSrc/utils/test-utils'

import { aiChatSelector, setSelectedTab } from 'uiSrc/slices/panels/aiAssistant'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { appFeatureFlagsFeaturesSelector } from 'uiSrc/slices/app/features'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import ChatsWrapper from './ChatsWrapper'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/panels/aiAssistant', () => ({
  ...jest.requireActual('uiSrc/slices/panels/aiAssistant'),
  aiChatSelector: jest.fn().mockReturnValue({
    activeTab: '',
  }),
}))

jest.mock('uiSrc/slices/app/features', () => ({
  ...jest.requireActual('uiSrc/slices/app/features'),
  appFeatureFlagsFeaturesSelector: jest.fn().mockReturnValue({
    documentationChat: {
      flag: true,
    },
    databaseChat: {
      flag: true,
    },
  }),
}))

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('ChatsWrapper', () => {
  it('should render', () => {
    expect(render(<ChatsWrapper />)).toBeTruthy()
  })

  it('should call proper dispatch after click on tab', () => {
    render(<ChatsWrapper />)

    fireEvent.mouseDown(screen.getByText('General'))

    expect(store.getActions()).toEqual([setSelectedTab(AiChatType.Assistance)])
  })

  it('should call proper dispatch after click on tab', () => {
    render(<ChatsWrapper />)

    fireEvent.mouseDown(screen.getByText('My Data'))

    expect(store.getActions()).toEqual([setSelectedTab(AiChatType.Query)])
  })

  it('should render general chat when tab is selected', () => {
    ;(aiChatSelector as jest.Mock).mockReturnValue({
      activeTab: AiChatType.Assistance,
    })
    render(<ChatsWrapper />)

    fireEvent.mouseDown(screen.getByText('General'))

    expect(screen.getByTestId('ai-general-chat')).toBeInTheDocument()
  })

  it('should render database chat when tab is selected', () => {
    ;(aiChatSelector as jest.Mock).mockReturnValue({
      activeTab: AiChatType.Query,
    })
    render(<ChatsWrapper />)

    fireEvent.mouseDown(screen.getByText('General'))

    expect(screen.getByTestId('ai-document-chat')).toBeInTheDocument()
  })

  it('shoud not render tabs if chats are disabled', () => {
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      documentationChat: {
        flag: false,
      },
      databaseChat: {
        flag: false,
      },
    })

    render(<ChatsWrapper />)

    expect(screen.queryByTestId('ai-general-chat_tab')).not.toBeInTheDocument()
    expect(screen.queryByTestId('ai-database-chat_tab')).not.toBeInTheDocument()
  })

  it('shoud not render tabs if only 1 chat is available', () => {
    ;(aiChatSelector as jest.Mock).mockReturnValue({
      activeTab: AiChatType.Assistance,
    })
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      documentationChat: {
        flag: true,
      },
      databaseChat: {
        flag: false,
      },
    })

    render(<ChatsWrapper />)

    expect(screen.queryByTestId('ai-general-chat_tab')).not.toBeInTheDocument()
    expect(screen.queryByTestId('ai-database-chat_tab')).not.toBeInTheDocument()

    expect(screen.getByTestId('ai-general-chat')).toBeInTheDocument()
  })

  it('shoud switch to another chat if current is not available', async () => {
    ;(aiChatSelector as jest.Mock).mockReturnValue({
      activeTab: AiChatType.Query,
    })
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      documentationChat: {
        flag: true,
      },
      databaseChat: {
        flag: false,
      },
    })

    await act(async () => {
      render(<ChatsWrapper />)
    })

    expect(store.getActions()).toEqual([setSelectedTab(AiChatType.Assistance)])
  })

  it('should call proper telemetry after open chat', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(aiChatSelector as jest.Mock).mockReturnValue({
      activeTab: AiChatType.Query,
    })
    ;(appFeatureFlagsFeaturesSelector as jest.Mock).mockReturnValue({
      documentationChat: {
        flag: true,
      },
      databaseChat: {
        flag: true,
      },
    })
    render(<ChatsWrapper />)

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_OPENED,
      eventData: {
        chat: AiChatType.Query,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
