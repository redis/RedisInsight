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
  deleteConsumers,
  loadConsumerGroups,
  selectedGroupSelector,
  setSelectedConsumer,
} from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { bufferToString } from 'uiSrc/utils'
import { TEXT_CONSUMER_GROUP_NAME_TOO_LONG } from 'uiSrc/constants'
import {
  MOCK_TRUNCATED_BUFFER_VALUE,
  MOCK_TRUNCATED_STRING_VALUE,
} from 'uiSrc/mocks/data/bigString'
import { ConsumerDto } from 'apiSrc/modules/browser/stream/dto'
import ConsumersViewWrapper, { Props } from './ConsumersViewWrapper'
import ConsumersView, { Props as ConsumersViewProps } from './ConsumersView'

jest.mock('uiSrc/slices/browser/stream', () => ({
  ...jest.requireActual('uiSrc/slices/browser/stream'),
  selectedGroupSelector: jest.fn(
    () =>
      jest.requireActual('uiSrc/slices/browser/stream').selectedGroupSelector,
  ),
}))

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('./ConsumersView', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const mockConsumerName = 'group'
const mockConsumers: ConsumerDto[] = [
  {
    name: {
      ...bufferToString('test'),
      viewValue: 'test',
    },
    idle: 123,
    pending: 321,
  },
  {
    name: {
      ...bufferToString('test2'),
      viewValue: 'test2',
    },
    idle: 13,
    pending: 31,
  },
]

const mockConsumersView = jest.fn((props: ConsumersViewProps) => (
  <div data-testid="stream-consumers-container">
    <button
      type="button"
      data-testid="select-consumer-btn"
      onClick={() => props?.onSelectConsumer?.({ name: mockConsumerName })}
    >
      some consumer name
    </button>

    <VirtualTable
      items={mockConsumers}
      loading={false}
      onRowClick={props?.onSelectConsumer}
      columns={props.columns}
    />
  </div>
))

describe('ConsumersViewWrapper', () => {
  beforeAll(() => {
    ConsumersView.mockImplementation(mockConsumersView)
  })

  it('should render', () => {
    expect(
      render(<ConsumersViewWrapper {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should render Consumers container', () => {
    render(<ConsumersViewWrapper {...instance(mockedProps)} />)

    expect(screen.getByTestId('stream-consumers-container')).toBeInTheDocument()
  })

  it('should select Consumer', () => {
    render(<ConsumersViewWrapper {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('select-consumer-btn'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedConsumer(),
      loadConsumerGroups(false),
    ])
  })

  it('should delete Consumer', () => {
    render(<ConsumersViewWrapper {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('remove-consumer-button-test-icon'))
    fireEvent.click(screen.getByTestId('remove-consumer-button-test'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      deleteConsumers(),
    ])
  })

  describe('truncated data', () => {
    it('should pass special noItemsMessageString message for truncated group name', () => {
      ;(selectedGroupSelector as jest.Mock).mockImplementationOnce(() => ({
        name: MOCK_TRUNCATED_BUFFER_VALUE,
        nameString: MOCK_TRUNCATED_STRING_VALUE,
        data: [],
        selectedConsumer: null,
        lastRefreshTime: null,
      }))

      render(<ConsumersViewWrapper {...instance(mockedProps)} />)

      expect(mockConsumersView).toHaveBeenCalledWith(
        expect.objectContaining({
          noItemsMessageString: TEXT_CONSUMER_GROUP_NAME_TOO_LONG,
          data: [],
        }),
        expect.anything(),
      )
    })
  })
})
