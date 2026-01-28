import React from 'react'
import { useSelector } from 'react-redux'
import { cloneDeep } from 'lodash'
import {
  cleanup,
  fireEvent,
  mockedStore,
  render,
  screen,
  act,
} from 'uiSrc/utils/test-utils'
import { loadInstancesSuccess } from 'uiSrc/slices/instances/instances'
import { RootState, store } from 'uiSrc/slices/store'
import { ConnectionType, Instance } from 'uiSrc/slices/interfaces'
import SearchDatabasesList from './SearchDatabasesList'

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}))

let storeMock: typeof mockedStore
const connectedInstancesMock: Instance[] = [
  {
    id: '1',
    name: 'local',
    host: 'localhost',
    port: 6379,
    visible: true,
    modules: [],
    connectionType: ConnectionType.Sentinel,
    lastConnection: new Date(),
    tags: [
      {
        id: '1',
        key: 'env',
        value: 'prod',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    version: '',
  },
  {
    id: '2',
    name: 'cloud',
    host: 'cloud',
    port: 6379,
    visible: true,
    modules: [],
    connectionType: ConnectionType.Cluster,
    lastConnection: new Date(),
    tags: [],
    version: '',
  },
]

const otherInstancesMock: Instance[] = [
  /*
    Reasoning behind the mock data:
    - The 'not_connected' instance simulates a Redis instance that is not currently connected.
    - The 'some_future_unrecognized_connection_type' instance represents a Redis instance with a connection type that is not
      recognized by the current application logic (e.g something is added in future and this part of the application is not yet aware of it).
  */
  {
    id: '3',
    name: 'not_connected',
    host: 'not_connected',
    port: 6379,
    visible: true,
    modules: [],
    connectionType: 'NOT CONNECTED' as any,
    tags: [],
    version: '',
  },
  {
    id: '4',
    name: 'some_future_unrecognized_connection_type',
    host: 'some_future_unrecognized_connection_type',
    port: 6379,
    visible: true,
    modules: [],
    connectionType: 'UNRECOGNIZED' as any,
    tags: [],
    version: '',
  },
  {
    id: '5',
    name: 'undefined_connection_type',
    host: 'undefined_connection_type',
    port: 6379,
    visible: true,
    modules: [],
    connectionType: undefined,
    tags: [],
    version: '',
  },
]

const mockInitialState = (
  state: RootState,
  instances: Instance[],
  options?: { selectedTags?: Set<string> },
) => {
  ;(useSelector as jest.Mock).mockImplementation(
    (callback: (arg0: RootState) => RootState) =>
      callback({
        ...state,
        connections: {
          ...state.connections,
          instances: {
            ...state.connections.instances,
            data: instances,
          },
          tags: {
            ...state.connections.tags,
            selectedTags:
              options?.selectedTags ?? state.connections.tags?.selectedTags,
          },
        },
      }),
  )
}

const simulateUserTypedInSearchBox = async (value: string) => {
  await act(() => {
    fireEvent.change(screen.getByTestId('search-database-list'), {
      target: { value },
    })
  })
}

beforeEach(() => {
  cleanup()
  storeMock = cloneDeep(mockedStore)
  storeMock.clearActions()
})

describe('SearchDatabasesList', () => {
  it('should render', () => {
    mockInitialState(store.getState(), connectedInstancesMock)
    expect(render(<SearchDatabasesList />)).toBeTruthy()
  })

  it.each([
    {
      description: 'with connected instances',
      instancesMock: connectedInstancesMock,
      expectedInstances: [
        { ...connectedInstancesMock[0], visible: false },
        { ...connectedInstancesMock[1], visible: false },
      ],
    },
    {
      description: 'with other than connected connectionType',
      instancesMock: otherInstancesMock,
      expectedInstances: [
        { ...otherInstancesMock[0], visible: false },
        { ...otherInstancesMock[1], visible: false },
        { ...otherInstancesMock[2], visible: false },
      ],
    },
  ])(
    'should call loadInstancesSuccess with all instances hidden after typing value not matching anything ($description)',
    async ({ instancesMock, expectedInstances }) => {
      mockInitialState(store.getState(), instancesMock)

      render(<SearchDatabasesList />)

      await simulateUserTypedInSearchBox('value_which_matches_nothing')

      const expectedActions = [loadInstancesSuccess(expectedInstances)]
      expect(storeMock.getActions()).toEqual(expectedActions)
    },
  )

  it('should call loadInstancesSuccess with not matching instances hidden when selected tags in state are provided', async () => {
    mockInitialState(store.getState(), connectedInstancesMock, {
      selectedTags: new Set(['env:prod']),
    })

    const expectedInstancesAfterRendering = [
      { ...connectedInstancesMock[0], visible: true },
      { ...connectedInstancesMock[1], visible: false },
    ]

    render(<SearchDatabasesList />)

    const expectedActions = [
      loadInstancesSuccess(expectedInstancesAfterRendering),
    ]
    expect(storeMock.getActions()).toEqual(expectedActions)
  })
})
