import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import {
  loadConsumerGroups,
  selectedConsumerSelector,
  setSelectedGroup,
} from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import {
  MOCK_TRUNCATED_BUFFER_VALUE,
  MOCK_TRUNCATED_STRING_VALUE,
} from 'uiSrc/mocks/data/bigString'
import { TEXT_CONSUMER_NAME_TOO_LONG } from 'uiSrc/constants'
import { PendingEntryDto } from 'apiSrc/modules/browser/stream/dto'
import MessagesView, { Props as MessagesViewProps } from './MessagesView'
import MessagesViewWrapper, { Props } from './MessagesViewWrapper'

jest.mock('uiSrc/slices/browser/stream', () => ({
  ...jest.requireActual('uiSrc/slices/browser/stream'),
  selectedConsumerSelector: jest.fn(
    () =>
      jest.requireActual('uiSrc/slices/browser/stream')
        .selectedConsumerSelector,
  ),
}))

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('./MessagesView', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

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

const mockMessagesView = jest.fn((props: MessagesViewProps) => (
  <div data-testid="stream-messages-container">
    <VirtualTable
      items={mockMessages}
      loading={false}
      columns={props.columns}
    />
  </div>
))

describe('MessagesViewWrapper', () => {
  beforeAll(() => {
    MessagesView.mockImplementation(mockMessagesView)
  })

  it('should render', () => {
    expect(
      render(<MessagesViewWrapper {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  // it('should render Messages container', () => {
  //   render(<MessagesViewWrapper {...instance(mockedProps)} />)

  //   expect(screen.getByTestId('stream-messages-container')).toBeInTheDocument()
  // })

  it.skip('should claim Message', () => {
    render(<MessagesViewWrapper {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('claim-message-btn'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedGroup(),
      loadConsumerGroups(false),
    ])
  })

  describe('truncated data', () => {
    it('should pass special noItemsMessageString message for truncated group name', () => {
      ;(selectedConsumerSelector as jest.Mock).mockImplementationOnce(() => ({
        name: MOCK_TRUNCATED_BUFFER_VALUE,
        nameString: MOCK_TRUNCATED_STRING_VALUE,
        pending: 0,
        idle: 0,
        data: [],
        lastRefreshTime: null,
      }))

      render(<MessagesViewWrapper {...instance(mockedProps)} />)

      expect(mockMessagesView).toHaveBeenCalledWith(
        expect.objectContaining({
          noItemsMessageString: TEXT_CONSUMER_NAME_TOO_LONG,
          data: [],
        }),
        expect.anything(),
      )
    })
  })
})
