import React from 'react'
import { render, screen } from 'uiSrc/utils/test-utils'

import { pubSubSelector as pubSubSelectorMock } from 'uiSrc/slices/pubsub/pubsub'
import MessagesListWrapper from './MessagesListWrapper'

jest.mock('uiSrc/slices/pubsub/pubsub', () => ({
  ...jest.requireActual('uiSrc/slices/pubsub/pubsub'),
  pubSubSelector: jest.fn().mockReturnValue({
    isSubscribed: false,
    messages: [],
  }),
}))

const pubSubSelector = pubSubSelectorMock as jest.Mock

afterEach(() => {
  jest.clearAllMocks()
})

describe('MessagesListWrapper', () => {
  it('should render EmptyMessagesList by default', () => {
    const { queryByTestId } = render(<MessagesListWrapper />)

    expect(queryByTestId('messages-list')).not.toBeInTheDocument()
    expect(queryByTestId('empty-messages-list')).toBeInTheDocument()
  })

  it('should render empty MessagesList if client is subscribed and no messages', () => {
    pubSubSelector.mockReturnValue({
      isSubscribed: true,
      messages: [],
    })

    const { queryByTestId } = render(<MessagesListWrapper />)

    expect(queryByTestId('messages-list')).toBeInTheDocument()
    expect(queryByTestId('empty-messages-list')).not.toBeInTheDocument()
    expect(screen.queryByText('No messages published yet')).toBeInTheDocument()
  })

  it('should render messages if there are some', () => {
    pubSubSelector.mockReturnValue({
      messages: [{ time: 123, channel: 'channel', message: 'msg' }],
    })

    render(<MessagesListWrapper />)

    expect(screen.queryByTestId('messages-list')).toBeInTheDocument()
    expect(screen.queryByTestId('empty-messages-list')).not.toBeInTheDocument()
    expect(screen.queryByText('msg')).toBeInTheDocument()
  })

  it('should render messages if there are some no matter if client is subscribed', () => {
    pubSubSelector.mockReturnValue({
      messages: [{ time: 123, channel: 'channel', message: 'msg' }],
      isSubscribed: false,
    })

    render(<MessagesListWrapper />)
    expect(screen.queryByText('msg')).toBeInTheDocument()
  })

  it('should render header with count and "Subscribed" badge when subscribed and no messages', () => {
    pubSubSelector.mockReturnValue({ isSubscribed: true, messages: [] })

    render(<MessagesListWrapper />)

    expect(screen.getByText('Messages:')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
    expect(screen.getByText('Status:')).toBeInTheDocument()
    expect(screen.getByText('Subscribed')).toBeInTheDocument()

    expect(screen.getByText('Timestamp')).toBeInTheDocument()
    expect(screen.getByText('Channel')).toBeInTheDocument()
    expect(screen.getByText('Message')).toBeInTheDocument()

    expect(screen.getByText('No messages published yet')).toBeInTheDocument()
  })

  it('should render header with count and "Unsubscribed" badge when messages exist but not subscribed', () => {
    const items = [
      { time: 123, channel: 'a', message: 'x' },
      { time: 456, channel: 'b', message: 'y' },
    ]
    pubSubSelector.mockReturnValue({ isSubscribed: false, messages: items })

    render(<MessagesListWrapper />)

    expect(screen.getByText('Messages:')).toBeInTheDocument()
    expect(screen.getByText(String(items.length))).toBeInTheDocument()
    expect(screen.getByText('Status:')).toBeInTheDocument()
    expect(screen.getByText('Unsubscribed')).toBeInTheDocument()

    expect(screen.getByTestId('messages-list')).toBeInTheDocument()
  })
})
