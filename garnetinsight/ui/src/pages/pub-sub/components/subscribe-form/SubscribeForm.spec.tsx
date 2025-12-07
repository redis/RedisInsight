// SubscribeForm.spec.tsx
import React from 'react'
import { fireEvent, waitFor } from '@testing-library/react'
import { cloneDeep } from 'lodash'
import { toggleSubscribeTriggerPubSub } from 'uiSrc/slices/pubsub/pubsub'
import {
  cleanup,
  clearStoreActions,
  initialStateDefault,
  mockStore,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'

import SubscribeForm from './SubscribeForm'
import { SubscriptionType } from 'apiSrc/modules/pub-sub/constants'

let store: typeof mockedStore

const createTestStateWithPubSub = (pubsubOverrides = {}) => {
  const state = cloneDeep(initialStateDefault)
  state.pubsub = {
    isSubscribed: false,
    loading: false,
    publishing: false,
    error: '',
    isSubscribeTriggered: false,
    isConnected: false,
    subscriptions: [],
    messages: [],
    count: 0,
    ...pubsubOverrides,
  }
  return state
}

const renderSubscribeForm = (pubsubOverrides = {}) => {
  const initialStoreState = createTestStateWithPubSub(pubsubOverrides)
  return render(<SubscribeForm />, {
    store: mockStore(initialStoreState),
  })
}

const getChannelsInput = () => screen.getByTestId('channels-input')
const getSubscribeBtn = () => screen.getByTestId('subscribe-btn')

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('SubscribeForm', () => {
  it('should initialize channels from subscriptions', async () => {
    renderSubscribeForm({
      subscriptions: [
        { channel: 'a.*', type: SubscriptionType.PSubscribe },
        { channel: 'b.c', type: SubscriptionType.PSubscribe },
      ],
    })

    await waitFor(() =>
      expect(screen.getByDisplayValue('a.* b.c')).toBeInTheDocument(),
    )
  })

  it('should use default "*" when no subscriptions', async () => {
    renderSubscribeForm({
      subscriptions: [],
    })

    await waitFor(() =>
      expect(screen.getByDisplayValue('*')).toBeInTheDocument(),
    )
  })

  it('should restore default "*" on blur when empty', async () => {
    render(<SubscribeForm />)

    fireEvent.change(getChannelsInput(), {
      target: { value: '' },
    })
    fireEvent.blur(getChannelsInput())

    await waitFor(() =>
      expect(screen.getByDisplayValue('*')).toBeInTheDocument(),
    )
  })

  it('should update channels as user types', () => {
    render(<SubscribeForm />)
    fireEvent.change(getChannelsInput(), {
      target: { value: 'alpha beta.*' },
    })
    expect(screen.getByDisplayValue('alpha beta.*')).toBeInTheDocument()
  })

  it('should dispatch toggleSubscribe with current channels value', () => {
    render(<SubscribeForm />)

    fireEvent.change(getChannelsInput(), {
      target: { value: 'news.* logs.error' },
    })
    fireEvent.click(getSubscribeBtn())

    expect(clearStoreActions(mockedStore.getActions())).toEqual(
      clearStoreActions([toggleSubscribeTriggerPubSub('news.* logs.error')]),
    )
  })

  it('should disable input when subscribed and shows "Unsubscribe" label', () => {
    renderSubscribeForm({
      isSubscribed: true,
    })

    expect(getChannelsInput()).toBeDisabled()
    expect(getSubscribeBtn()).toHaveTextContent('Unsubscribe')
  })

  it('should show "Subscribe" label when not subscribed', () => {
    renderSubscribeForm({
      isSubscribed: false,
    })
    expect(getSubscribeBtn()).toHaveTextContent('Subscribe')
  })

  it('should disable subscribe button when loading', () => {
    renderSubscribeForm({
      loading: true,
    })
    expect(getSubscribeBtn()).toBeDisabled()
  })
})
