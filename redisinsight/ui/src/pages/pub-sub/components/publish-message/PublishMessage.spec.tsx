import React from 'react'
import { act, fireEvent, waitFor } from '@testing-library/react'
import { cloneDeep } from 'lodash'

import {
  cleanup,
  initialStateDefault,
  mockStore,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import { ConnectionType } from 'uiSrc/slices/interfaces'
import PublishMessage from './PublishMessage'
import { publishMessageAction } from 'uiSrc/slices/pubsub/pubsub'
import { setPubSubFieldsContext } from 'uiSrc/slices/app/context'

let mockedConnType = ConnectionType.Standalone
jest.mock('uiSrc/components/hooks/useConnectionType', () => ({
  useConnectionType: () => mockedConnType,
}))

jest.mock('uiSrc/slices/pubsub/pubsub', () => {
  const actual = jest.requireActual('uiSrc/slices/pubsub/pubsub')
  return {
    ...actual,
    publishMessageAction: jest.fn(
      (instanceId, channel, message, onSuccess) => (dispatch: any) => {
        const action = {
          type: 'pubsub/publishMessageAction',
          payload: [instanceId, channel, message, onSuccess],
        }
        dispatch(action)
        return Promise.resolve()
      },
    ),
  }
})

jest.mock('uiSrc/slices/app/context', () => {
  const actual = jest.requireActual('uiSrc/slices/app/context')
  return {
    ...actual,
    appContextPubSub: (state: any) =>
      state?.app?.context?.pubsub ?? { channel: '', message: '' },
    setPubSubFieldsContext: jest.fn((fields: any) => (dispatch: any) => {
      const action = {
        type: 'app/setPubSubFieldsContext',
        payload: fields,
      }
      dispatch(action)
      return action
    }),
  }
})

let store: typeof mockedStore

const createTestStateWithContext = (
  contextOverrides = {},
  pubsubOverrides = {},
) => {
  const state = cloneDeep(initialStateDefault)
  state.app.context = {
    ...state.app.context,
    ...contextOverrides,
  }
  state.pubsub = {
    loading: false,
    publishing: false,
    error: '',
    subscriptions: [],
    isSubscribeTriggered: false,
    isConnected: false,
    isSubscribed: false,
    messages: [],
    count: 0,
    ...pubsubOverrides,
  }
  return state
}

const renderPublishMessage = (contextOverrides = {}, pubsubOverrides = {}) => {
  const initialStoreState = createTestStateWithContext(
    contextOverrides,
    pubsubOverrides,
  )
  return render(<PublishMessage />, {
    store: mockStore(initialStoreState),
  })
}

const getChannelField = () => screen.getByTestId('field-channel-name')
const getMessageField = () => screen.getByTestId('field-message')
const getSubmitBtn = () => screen.getByTestId('publish-message-submit')

beforeEach(() => {
  jest.useFakeTimers()
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
  jest.mocked(publishMessageAction).mockClear()
  jest.mocked(setPubSubFieldsContext).mockClear()
  mockedConnType = ConnectionType.Standalone
})

afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
})

describe('PublishMessage', () => {
  it('should render basic form fields and button', () => {
    expect(render(<PublishMessage />)).toBeTruthy()
    expect(getChannelField()).toBeInTheDocument()
    expect(getMessageField()).toBeInTheDocument()
    expect(getSubmitBtn()).toBeInTheDocument()
  })

  it('should initialize channel/message from app context', async () => {
    renderPublishMessage({
      pubsub: { channel: 'orders', message: 'hello' },
    })

    await waitFor(() => {
      expect(screen.getByDisplayValue('orders')).toBeInTheDocument()
      expect(screen.getByDisplayValue('hello')).toBeInTheDocument()
    })
  })

  it('should dispatche publish action with instanceId, channel, message, and a callback', () => {
    render(<PublishMessage />, {
      store: mockedStore,
    })

    fireEvent.change(getChannelField(), {
      target: { value: 'news' },
    })
    fireEvent.change(getMessageField(), {
      target: { value: 'ping' },
    })

    fireEvent.click(getSubmitBtn())

    const actions = mockedStore.getActions()
    expect(actions[0].type).toBe('pubsub/publishMessageAction')

    const [iid, ch, msg, cb] = actions[0].payload
    expect(iid).toBe('instanceId')
    expect(ch).toBe('news')
    expect(msg).toBe('ping')
    expect(typeof cb).toBe('function')
  })

  it('should clear message, shows success badge with affected clients, hides button on success published message', async () => {
    render(<PublishMessage />)

    fireEvent.change(getChannelField(), {
      target: { value: 'alpha' },
    })
    fireEvent.change(getMessageField(), {
      target: { value: 'hello world' },
    })
    fireEvent.click(getSubmitBtn())

    const [, , , onSuccess] = mockedStore.getActions()[0].payload
    const affectedClients = 7
    act(() => onSuccess(affectedClients))

    await waitFor(() => {
      expect(getMessageField()).toHaveValue('')
      expect(
        screen.queryByTestId('publish-message-submit'),
      ).not.toBeInTheDocument()
    })

    expect(
      screen.getByText(`Published (${affectedClients})`),
    ).toBeInTheDocument()
  })

  it('should hide success badge client count (just "Published") when connection type is cluster', async () => {
    mockedConnType = ConnectionType.Cluster
    render(<PublishMessage />)

    fireEvent.click(getSubmitBtn())
    const [, , , onSuccess] = mockedStore.getActions()[0].payload
    const affectedClients = 123
    act(() => onSuccess(affectedClients))

    await waitFor(() => {
      expect(screen.getByText(/^Published$/)).toBeInTheDocument()
    })
    expect(
      screen.queryByText(`Published (${affectedClients})`),
    ).not.toBeInTheDocument()
  })

  it('should auto-hide success badge after HIDE_BADGE_TIMER and shows submit button again', () => {
    render(<PublishMessage />)

    fireEvent.click(getSubmitBtn())
    const [, , , onSuccess] = mockedStore.getActions()[0].payload
    act(() => onSuccess(1))

    expect(screen.getByText(/Published/)).toBeInTheDocument()

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(screen.queryByText(/Published/)).not.toBeInTheDocument()
    expect(getSubmitBtn()).toBeInTheDocument()
  })

  it('should persist latest channel/message to context on unmount', () => {
    const { unmount } = render(<PublishMessage />, {
      store: mockedStore,
    })

    fireEvent.change(getChannelField(), {
      target: { value: 'finalCh' },
    })
    fireEvent.change(getMessageField(), {
      target: { value: 'finalMsg' },
    })

    unmount()

    const actions = mockedStore.getActions()
    const setCtx = actions.find(
      (a: any) => a.type === 'app/setPubSubFieldsContext',
    )
    expect(setCtx).toBeTruthy()
    expect(setCtx.payload).toEqual({ channel: 'finalCh', message: 'finalMsg' })
  })
})
