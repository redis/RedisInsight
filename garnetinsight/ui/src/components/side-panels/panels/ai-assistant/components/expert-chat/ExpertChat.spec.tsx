import React from 'react'
import { cloneDeep } from 'lodash'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  mockedStoreFn,
  render,
  screen,
  waitForRiPopoverVisible,
} from 'uiSrc/utils/test-utils'

import {
  aiExpertChatSelector,
  clearExpertChatHistory,
  getExpertChatHistory,
  getExpertChatHistorySuccess,
  sendExpertQuestion,
  updateExpertChatAgreements,
} from 'uiSrc/slices/panels/aiAssistant'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AiChatType } from 'uiSrc/slices/interfaces/aiAssistant'
import { apiService } from 'uiSrc/services'
import { connectedInstanceSelector } from 'uiSrc/slices/instances/instances'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'
import { loadList } from 'uiSrc/slices/browser/redisearch'
import {
  changeSelectedTab,
  changeSidePanel,
  resetExplorePanelSearch,
} from 'uiSrc/slices/panels/sidePanels'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'
import ExpertChat from './ExpertChat'

jest.mock('uiSrc/telemetry', () => ({
  ...jest.requireActual('uiSrc/telemetry'),
  sendEventTelemetry: jest.fn(),
}))

jest.mock('uiSrc/slices/panels/aiAssistant', () => ({
  ...jest.requireActual('uiSrc/slices/panels/aiAssistant'),
  aiExpertChatSelector: jest.fn().mockReturnValue({
    loading: false,
    messages: [],
    agreements: [],
  }),
}))

jest.mock('uiSrc/slices/instances/instances', () => ({
  ...jest.requireActual('uiSrc/slices/instances/instances'),
  connectedInstanceSelector: jest.fn().mockReturnValue({
    modules: [],
  }),
}))

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    instanceId: 'instanceId',
  }),
}))

let store: typeof mockedStore

describe('ExpertChat', () => {
  beforeEach(() => {
    cleanup()
    store = cloneDeep(mockedStoreFn())
    store.clearActions()
  })

  it('should render', () => {
    expect(render(<ExpertChat />, { store })).toBeTruthy()
  })

  it('should proper components render by default', () => {
    render(<ExpertChat />, { store })

    expect(
      screen.getByTestId('ai-expert-restart-session-btn'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('ai-chat-empty-history')).toBeInTheDocument()
    expect(screen.getByTestId('ai-submit-message-btn')).toBeInTheDocument()
  })

  it('should show loading', () => {
    ;(aiExpertChatSelector as jest.Mock).mockReturnValue({
      loading: true,
      messages: [],
      agreements: [],
    })
    render(<ExpertChat />, { store })

    expect(screen.getByTestId('ai-loading-spinner')).toBeInTheDocument()
    expect(
      screen.queryByTestId('ai-chat-empty-history'),
    ).not.toBeInTheDocument()
  })

  it('should call proper actions by default', () => {
    render(<ExpertChat />, { store })

    expect(store.getActions()).toEqual([getExpertChatHistory()])
  })

  it('should call fetch indexes', () => {
    ;(aiExpertChatSelector as jest.Mock).mockReturnValue({
      loading: true,
      messages: [],
      agreements: [],
    })
    ;(connectedInstanceSelector as jest.Mock).mockImplementationOnce(() => ({
      modules: [
        { name: RedisDefaultModules.FT },
        { name: RedisDefaultModules.ReJSON },
      ],
    }))

    render(<ExpertChat />, { store })

    expect(store.getActions()).toEqual([getExpertChatHistory(), loadList()])
  })

  it('should call action after submit message', () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(aiExpertChatSelector as jest.Mock).mockReturnValueOnce({
      loading: false,
      messages: [],
      agreements: ['instanceId'],
    })
    render(<ExpertChat />, { store })

    const afterRenderActions = [...store.getActions()]

    act(() => {
      fireEvent.change(screen.getByTestId('ai-message-textarea'), {
        target: { value: 'test' },
      })
    })

    fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      sendExpertQuestion(expect.objectContaining({ content: 'test' })),
    ])

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_MESSAGE_SENT,
      eventData: {
        chat: AiChatType.Query,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it('should show agreements after click submit', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(aiExpertChatSelector as jest.Mock).mockReturnValue({
      loading: false,
      messages: [],
      agreements: [],
    })
    render(<ExpertChat />, { store })

    const afterRenderActions = [...store.getActions()]

    act(() => {
      fireEvent.change(screen.getByTestId('ai-message-textarea'), {
        target: { value: 'test' },
      })
    })

    fireEvent.click(screen.getByTestId('ai-submit-message-btn'))

    await waitForRiPopoverVisible()

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_BOT_TERMS_DISPLAYED,
      eventData: {
        chat: AiChatType.Query,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()

    act(() => {
      fireEvent.click(screen.getByTestId('ai-accept-agreements'))
    })

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_BOT_TERMS_ACCEPTED,
      eventData: {
        chat: AiChatType.Query,
        databaseId: 'instanceId',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      updateExpertChatAgreements('instanceId'),
      sendExpertQuestion(expect.objectContaining({ content: 'test' })),
    ])
  })

  it('should call action after click on restart session', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    apiService.delete = jest.fn().mockResolvedValueOnce({ status: 200 })
    apiService.get = jest.fn().mockResolvedValueOnce({ status: 200, data: [] })
    ;(aiExpertChatSelector as jest.Mock).mockReturnValue({
      loading: false,
      messages: [{}],
      agreements: ['instanceId'],
    })

    render(<ExpertChat />, { store })

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('ai-expert-restart-session-btn'))

    await waitForRiPopoverVisible()
    await act(async () => {
      fireEvent.click(screen.getByTestId('ai-chat-restart-confirm'))
    })

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      getExpertChatHistorySuccess([]),
      clearExpertChatHistory(),
    ])

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.AI_CHAT_SESSION_RESTARTED,
      eventData: {
        chat: AiChatType.Query,
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })

  it.skip('should call proper actions after click tutorial in the initial message', async () => {
    const sendEventTelemetryMock = jest.fn()
    ;(sendEventTelemetry as jest.Mock).mockImplementation(
      () => sendEventTelemetryMock,
    )
    ;(aiExpertChatSelector as jest.Mock).mockReturnValue({
      loading: false,
      messages: [],
      agreements: ['instanceId'],
    })

    render(<ExpertChat />, { store })

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('tutorial-initial-message-link'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      changeSelectedTab(InsightsPanelTabs.Explore),
      changeSidePanel(SidePanels.Insights),
      resetExplorePanelSearch(),
    ])

    expect(sendEventTelemetry).toBeCalledWith({
      event: TelemetryEvent.EXPLORE_PANEL_TUTORIAL_OPENED,
      eventData: {
        databaseId: 'instanceId',
        source: 'sample_data',
      },
    })
    ;(sendEventTelemetry as jest.Mock).mockRestore()
  })
})
