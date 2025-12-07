import React from 'react'
import { instance, mock } from 'ts-mockito'
import { cloneDeep } from 'lodash'
import {
  act,
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
} from 'uiSrc/utils/test-utils'
import {
  deleteConsumerGroups,
  loadConsumerGroups,
  setSelectedGroup,
  fetchConsumers,
} from 'uiSrc/slices/browser/stream'
import VirtualTable from 'uiSrc/components/virtual-table/VirtualTable'
import { stringToBuffer } from 'uiSrc/utils'
import { setSelectedKeyRefreshDisabled } from 'uiSrc/slices/browser/keys'
import { MOCK_TRUNCATED_BUFFER_VALUE } from 'uiSrc/mocks/data/bigString'
import { ConsumerGroupDto } from 'apiSrc/modules/browser/stream/dto'
import GroupsView, { Props as GroupsViewProps } from './GroupsView'
import GroupsViewWrapper, { Props } from './GroupsViewWrapper'

jest.mock('uiSrc/slices/browser/stream', () => ({
  ...jest.requireActual('uiSrc/slices/browser/stream'),
  streamGroupsSelector: jest.fn().mockReturnValue({
    loading: false,
    error: '',
    data: [],
    selectedGroup: null,
    lastRefreshTime: 0,
  }),
  fetchConsumers: jest
    .fn()
    .mockImplementation(
      jest.requireActual('uiSrc/slices/browser/stream').fetchConsumers,
    ),
}))

const mockedProps = mock<Props>()

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

jest.mock('./GroupsView', () => ({
  __esModule: true,
  namedExport: jest.fn(),
  default: jest.fn(),
}))

const mockGroups: ConsumerGroupDto[] = [
  {
    name: {
      ...stringToBuffer('test'),
      viewValue: 'test',
    },
    consumers: 123,
    pending: 321,
    smallestPendingId: '123',
    greatestPendingId: '123',
    lastDeliveredId: '123',
  },
  {
    name: {
      ...stringToBuffer('test2'),
      viewValue: 'test2',
    },
    consumers: 13,
    pending: 31,
    smallestPendingId: '3',
    greatestPendingId: '23',
    lastDeliveredId: '12',
  },
  {
    name: MOCK_TRUNCATED_BUFFER_VALUE,
    consumers: 1,
    pending: 1,
    smallestPendingId: 'n/a',
    greatestPendingId: 'n/a',
    lastDeliveredId: 'n/a',
  },
]

const mockGroupsView = jest.fn((props: GroupsViewProps) => (
  <div data-testid="stream-groups-container">
    <VirtualTable
      items={mockGroups}
      loading={false}
      onRowClick={props?.onSelectGroup}
      columns={props.columns}
    />
  </div>
))

describe('GroupsViewWrapper', () => {
  beforeAll(() => {
    ;(GroupsView as jest.Mock).mockImplementation(mockGroupsView)
  })

  it('should render', () => {
    expect(
      render(<GroupsViewWrapper {...instance(mockedProps)} />),
    ).toBeTruthy()
  })

  it('should render Groups container', () => {
    render(<GroupsViewWrapper {...instance(mockedProps)} />)

    expect(screen.getByTestId('stream-groups-container')).toBeInTheDocument()
  })

  it('should select Group', () => {
    render(<GroupsViewWrapper {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getAllByRole('row')[1])

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedGroup(mockGroups[0]),
      loadConsumerGroups(false),
    ])
  })

  it('should delete Group', () => {
    render(<GroupsViewWrapper {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    fireEvent.click(screen.getByTestId('remove-groups-button-test-icon'))
    fireEvent.click(screen.getByTestId('remove-groups-button-test'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      deleteConsumerGroups(),
    ])
  })

  it('should disable refresh when editing Group', () => {
    render(<GroupsViewWrapper {...instance(mockedProps)} />)

    const afterRenderActions = [...store.getActions()]

    act(() => {
      fireEvent.mouseEnter(screen.getByTestId('stream-group_content-value-123'))
    })
    fireEvent.click(screen.getByTestId('stream-group_edit-btn-123'))

    expect(store.getActions()).toEqual([
      ...afterRenderActions,
      setSelectedKeyRefreshDisabled(true),
    ])
  })

  describe('truncated values', () => {
    it('should not try to fetch consumers for truncated groups', async () => {
      jest.clearAllMocks()

      render(<GroupsViewWrapper {...instance(mockedProps)} />)

      fireEvent.click(screen.getAllByRole('row')[3])

      expect(fetchConsumers as jest.Mock).not.toHaveBeenCalled()
    })
  })
})
