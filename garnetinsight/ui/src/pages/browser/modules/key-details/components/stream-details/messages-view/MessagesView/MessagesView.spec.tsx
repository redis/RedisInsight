import React from 'react'
import { instance, mock } from 'ts-mockito'
import { render, screen } from 'uiSrc/utils/test-utils'
import { PendingEntryDto } from 'apiSrc/modules/browser/stream/dto'
import MessagesView, { Props } from './MessagesView'

const mockedProps = mock<Props>()
const mockMessages: PendingEntryDto[] = [
  {
    id: '123',
    consumerName: 'test',
    idle: 321,
    delivered: 321,
  },
  {
    id: '1234',
    consumerName: 'test2',
    idle: 3213,
    delivered: 1321,
  },
]

describe('MessagesView', () => {
  it('should render', () => {
    expect(
      render(<MessagesView {...instance(mockedProps)} data={mockMessages} />),
    ).toBeTruthy()
  })

  it('should show custom "empty message" when defined', () => {
    render(
      <MessagesView
        {...instance(mockedProps)}
        data={[]}
        noItemsMessageString="custom message"
      />,
    )

    expect(screen.getByTestId('stream-messages-container')).toHaveTextContent(
      'custom message',
    )
  })

  it('should show default "empty message" when not defined', () => {
    render(<MessagesView {...instance(mockedProps)} data={[]} />)

    expect(screen.getByTestId('stream-messages-container')).toHaveTextContent(
      'Your Consumer has no pending messages.',
    )
  })
})
