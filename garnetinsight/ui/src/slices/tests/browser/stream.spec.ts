import { AxiosError } from 'axios'
import { cloneDeep, omit } from 'lodash'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import successMessages from 'uiSrc/components/notifications/success-messages'
import { SortOrder } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { refreshKeyInfo } from 'uiSrc/slices/browser/keys'
import reducer, {
  initialState,
  setStreamInitialState,
  loadEntries,
  loadEntriesSuccess,
  loadEntriesFailure,
  loadMoreEntries,
  loadMoreEntriesSuccess,
  loadMoreEntriesFailure,
  addNewEntries,
  addNewEntriesSuccess,
  addNewEntriesFailure,
  removeStreamEntries,
  removeStreamEntriesSuccess,
  removeStreamEntriesFailure,
  updateStart,
  updateEnd,
  cleanRangeFilter,
  streamSelector,
  streamRangeSelector,
  fetchStreamEntries,
  refreshStreamEntries,
  setStreamViewType,
  loadConsumerGroups,
  loadConsumerGroupsSuccess,
  loadConsumerGroupsFailure,
  loadConsumersSuccess,
  loadConsumersFailure,
  loadConsumerMessagesSuccess,
  loadConsumerMessagesFailure,
  setSelectedGroup,
  setSelectedConsumer,
  fetchConsumerGroups,
  fetchConsumers,
  fetchConsumerMessages,
  deleteConsumerGroups,
  deleteConsumerGroupsAction,
  deleteConsumerGroupsSuccess,
  deleteConsumerGroupsFailure,
  deleteConsumersAction,
  deleteConsumers,
  deleteConsumersSuccess,
  deleteConsumersFailure,
  modifyLastDeliveredIdAction,
  modifyLastDeliveredId,
  modifyLastDeliveredIdSuccess,
  modifyLastDeliveredIdFailure,
  fetchMoreConsumerMessages,
  loadMoreConsumerMessagesSuccess,
  ackPendingEntriesAction,
  ackPendingEntries,
  ackPendingEntriesSuccess,
  ackPendingEntriesFailure,
  claimPendingMessages,
  claimConsumerMessages,
  claimConsumerMessagesSuccess,
  claimConsumerMessagesFailure,
  deleteMessageFromList,
} from 'uiSrc/slices/browser/stream'
import { StreamViewType } from 'uiSrc/slices/interfaces/stream'
import { bufferToString, stringToBuffer } from 'uiSrc/utils'
import {
  ConsumerDto,
  ConsumerGroupDto,
  ClaimPendingEntryDto,
  PendingEntryDto,
  UpdateConsumerGroupDto,
} from 'apiSrc/modules/browser/stream/dto'
import {
  addErrorNotification,
  addMessageNotification,
} from '../../app/notifications'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore

const mockedEntryData = {
  keyName: bufferToString('stream_example'),
  keyNameString: 'stream_example',
  total: 1,
  lastGeneratedId: '1652942518810-0',
  firstEntry: {
    id: '1652942518810-0',
    fields: { field: stringToBuffer('1'), name: stringToBuffer('2') },
  },
  lastEntry: {
    id: '1652942518810-0',
    fields: { field: stringToBuffer('1'), name: stringToBuffer('2') },
  },
  entries: [
    {
      id: '1652942518810-0',
      fields: { field: stringToBuffer('1'), name: stringToBuffer('2') },
    },
  ],
}

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
]

const mockConsumers: ConsumerDto[] = [
  {
    name: stringToBuffer('test'),
    nameString: 'test',
    idle: 123,
    pending: 321,
  },
  {
    name: stringToBuffer('test2'),
    nameString: 'test2',
    idle: 13,
    pending: 31,
  },
]

const mockMessages: PendingEntryDto[] = [
  {
    id: '123',
    consumerName: stringToBuffer('test'),
    idle: 321,
    delivered: 321,
  },
  {
    id: '1234',
    consumerName: stringToBuffer('test2'),
    idle: 3213,
    delivered: 1321,
  },
]

Date.now = jest.fn(() => Date.parse('2021-05-27'))

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('stream slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('setStreamInitialState', () => {
    it('should properly set initial state', () => {
      const nextState = reducer(initialState, setStreamInitialState())
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(initialState)
    })
  })

  describe('loadEntries', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadEntries(true))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadEntriesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...mockedEntryData,
        },
      }

      // Act
      const tempState = reducer(
        initialState,
        loadEntriesSuccess([mockedEntryData, SortOrder.DESC]),
      )

      const nextState = omit({ ...tempState }, 'data.lastRefreshTime')

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadEntriesFailure', () => {
    it('should properly set the state after failed fetched data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, loadEntriesFailure(error))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreEntries', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, loadMoreEntries())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreEntriesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
        error: '',
        data: {
          ...mockedEntryData,
        },
      }

      // Act
      const tempState = reducer(
        initialState,
        loadMoreEntriesSuccess(mockedEntryData),
      )
      const nextState = omit({ ...tempState }, 'data.lastRefreshTime')

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreEntriesFailure', () => {
    it('should properly set the state after failed fetched data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, loadMoreEntriesFailure(error))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('addNewEntries', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, addNewEntries())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('addNewEntriesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, addNewEntriesSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('addNewEntriesFailure', () => {
    it('should properly set the state after failed fetched data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, addNewEntriesFailure(error))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('removeStreamEntries', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, removeStreamEntries())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('removeStreamEntriesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, removeStreamEntriesSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('removeStreamEntriesFailure', () => {
    it('should properly set the state after failed fetched data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, removeStreamEntriesFailure(error))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('updateStart', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        range: {
          ...initialState.range,
          start: '10',
        },
      }

      // Act
      const nextState = reducer(initialState, updateStart('10'))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('updateEnd', () => {
    it('should properly set the state', () => {
      // Arrange
      const state = {
        ...initialState,
        range: {
          ...initialState.range,
          end: '100',
        },
      }

      // Act
      const nextState = reducer(initialState, updateEnd('100'))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('cleanRangeFilter', () => {
    it('should properly set the state', () => {
      // Arrange
      const startState = {
        ...initialState,
        range: {
          ...initialState.range,
          start: '100',
          end: '200',
        },
      }
      const stateRange = {
        ...initialState.range,
      }

      // Act
      const nextState = reducer(startState, cleanRangeFilter())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamRangeSelector(rootState)).toEqual(stateRange)
    })
  })

  describe('setStreamViewType', () => {
    it('should properly set stream view type', () => {
      // Arrange
      const state = {
        ...initialState,
        viewType: StreamViewType.Messages,
      }

      // Act
      const nextState = reducer(
        initialState,
        setStreamViewType(StreamViewType.Messages),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadConsumerGroups', () => {
    it('should properly set groups.loading = true', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
        groups: {
          ...initialState.groups,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, loadConsumerGroups())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadConsumerGroupsSuccess', () => {
    it('should properly set groups.data = payload', () => {
      // Arrange
      const data: ConsumerGroupDto[] = [
        {
          name: stringToBuffer('123'),
          consumers: 123,
          pending: 123,
          smallestPendingId: '123',
          greatestPendingId: '123',
          lastDeliveredId: '123',
        },
      ]
      const state = {
        ...initialState,
        loading: false,
        groups: {
          ...initialState.groups,
          data,
          lastRefreshTime: Date.now(),
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, loadConsumerGroupsSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadConsumersSuccess', () => {
    it('should properly set groups.selectedGroup.data = payload', () => {
      // Arrange
      const data: ConsumerDto[] = [
        {
          name: {
            ...stringToBuffer('123'),
            viewValue: '123',
          },
          pending: 123,
          idle: 123,
        },
      ]
      const state = {
        ...initialState,
        groups: {
          ...initialState.groups,
          selectedGroup: {
            data,
            lastRefreshTime: Date.now(),
          },
        },
      }

      // Act
      const nextState = reducer(initialState, loadConsumersSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadConsumerMessagesSuccess', () => {
    it('should properly set groups.selectedGroup.selectedConsumer.data = payload', () => {
      // Arrange
      const data: PendingEntryDto[] = [
        {
          id: '123',
          consumerName: '123',
          idle: 123,
          delivered: 123,
        },
      ]
      const state = {
        ...initialState,
        groups: {
          ...initialState.groups,
          selectedGroup: {
            selectedConsumer: {
              data,
              lastRefreshTime: Date.now(),
            },
          },
        },
      }

      // Act
      const nextState = reducer(initialState, loadConsumerMessagesSuccess(data))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadConsumerMessagesFailure', () => {
    it('should properly set error to groups and set viewType = Consumers payload', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        viewType: StreamViewType.Consumers,
        groups: {
          ...initialState.groups,
          loading: false,
          error,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadConsumerMessagesFailure(error),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadConsumersFailure', () => {
    it('should properly set error to groups and set viewType = Groups payload', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        viewType: StreamViewType.Groups,
        groups: {
          ...initialState.groups,
          loading: false,
          error,
        },
      }

      // Act
      const nextState = reducer(initialState, loadConsumersFailure(error))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadConsumerGroupsFailure', () => {
    it('should properly set error to groups payload', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        groups: {
          ...initialState.groups,
          loading: false,
          error,
        },
      }

      // Act
      const nextState = reducer(initialState, loadConsumerGroupsFailure(error))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('setSelectedGroup', () => {
    it('should properly set selectedGroups', () => {
      // Arrange
      const group = {
        name: stringToBuffer('group name'),
        nameString: 'group name',
      }

      const state = {
        ...initialState,
        groups: {
          ...initialState.groups,
          selectedGroup: group,
        },
      }

      // Act
      const nextState = reducer(initialState, setSelectedGroup(group))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('setSelectedConsumer', () => {
    it('should properly set selectedConsumer', () => {
      // Arrange
      const consumer = {
        name: stringToBuffer('consumer name'),
        nameString: 'consumer name',
      }
      const state = {
        ...initialState,
        groups: {
          ...initialState.groups,
          selectedGroup: {
            selectedConsumer: consumer,
          },
        },
      }

      // Act
      const nextState = reducer(initialState, setSelectedConsumer(consumer))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('loadMoreConsumerMessagesSuccess', () => {
    it('should properly concat more messages', () => {
      // Arrange
      const data: PendingEntryDto[] = [
        {
          id: '123',
          consumerName: '123',
          idle: 123,
          delivered: 123,
        },
      ]
      const state = {
        ...initialState,
        groups: {
          ...initialState.groups,
          selectedGroup: {
            selectedConsumer: {
              lastRefreshTime: Date.now(),
              data: [
                ...(initialState.groups.selectedGroup?.selectedConsumer?.data ??
                  []),
                ...data,
              ],
            },
          },
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        loadMoreConsumerMessagesSuccess(data),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('ackPendingEntries', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        groups: {
          ...initialState.groups,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, ackPendingEntries())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('ackPendingEntriesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        groups: {
          ...initialState.groups,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, ackPendingEntriesSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('ackPendingEntriesFailure', () => {
    it('should properly set the state after failed fetched data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        groups: {
          ...initialState.groups,
          loading: false,
          error,
        },
      }

      // Act
      const nextState = reducer(initialState, ackPendingEntriesFailure(error))

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('claimConsumerMessages', () => {
    it('should properly set the state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        groups: {
          ...initialState.groups,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, claimConsumerMessages())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('claimConsumerMessagesSuccess', () => {
    it('should properly set the state with fetched data', () => {
      // Arrange

      const state = {
        ...initialState,
        groups: {
          ...initialState.groups,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(initialState, claimConsumerMessagesSuccess())

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('claimConsumerMessagesFailure', () => {
    it('should properly set the state after failed fetched data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        groups: {
          ...initialState.groups,
          loading: false,
          error,
        },
      }

      // Act
      const nextState = reducer(
        initialState,
        claimConsumerMessagesFailure(error),
      )

      // Assert
      const rootState = {
        ...initialStateDefault,
        browser: { stream: nextState },
      }
      expect(streamSelector(rootState)).toEqual(state)
    })
  })

  describe('thunks', () => {
    describe('fetchStreamEntries', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const responsePayload = { data: mockedEntryData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchStreamEntries(
            mockedEntryData.keyName,
            500,
            SortOrder.DESC,
            true,
          ),
        )

        // Assert
        const expectedActions = [
          loadEntries(true),
          loadEntriesSuccess([mockedEntryData, SortOrder.DESC]),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          fetchStreamEntries(
            mockedEntryData.keyName,
            500,
            SortOrder.DESC,
            true,
          ),
        )

        // Assert
        const expectedActions = [
          loadEntries(true),
          addErrorNotification(responsePayload as AxiosError),
          loadEntriesFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('refreshStreamEntries', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const responsePayload = { data: mockedEntryData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          refreshStreamEntries(mockedEntryData.keyName, true),
        )

        // Assert
        const expectedActions = [
          loadEntries(true),
          loadEntriesSuccess([mockedEntryData, SortOrder.DESC]),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          refreshStreamEntries(mockedEntryData.keyName, true),
        )

        // Assert
        const expectedActions = [
          loadEntries(true),
          addErrorNotification(responsePayload as AxiosError),
          loadEntriesFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchConsumerGroups', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const responsePayload = { data: mockGroups, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchConsumerGroups())

        // Assert
        const expectedActions = [
          loadConsumerGroups(),
          loadConsumerGroupsSuccess(mockGroups),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchConsumerGroups())

        // Assert
        const expectedActions = [
          loadConsumerGroups(),
          addErrorNotification(responsePayload as AxiosError),
          loadConsumerGroupsFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchConsumers', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const responsePayload = { data: mockConsumers, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchConsumers())

        // Assert
        const expectedActions = [
          loadConsumerGroups(),
          loadConsumersSuccess(mockConsumers),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchConsumers())

        // Assert
        const expectedActions = [
          loadConsumerGroups(),
          addErrorNotification(responsePayload as AxiosError),
          loadConsumersFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchConsumerMessages', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const responsePayload = { data: mockMessages, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchConsumerMessages())

        // Assert
        const expectedActions = [
          loadConsumerGroups(),
          loadConsumerMessagesSuccess(mockMessages),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchConsumerMessages())

        // Assert
        const expectedActions = [
          loadConsumerGroups(),
          addErrorNotification(responsePayload as AxiosError),
          loadConsumerMessagesFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('modifyLastDeliveredIdAction', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const data: UpdateConsumerGroupDto = {
          keyName: 'key',
          name: 'name',
          lastDeliveredId: '0-1',
        }
        const responsePayload = { data: mockMessages, status: 200 }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        const responsePayloadPost = { data: mockConsumers, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayloadPost)

        // Act
        await store.dispatch<any>(modifyLastDeliveredIdAction(data))

        // Assert
        const expectedActions = [
          modifyLastDeliveredId(),
          modifyLastDeliveredIdSuccess(),
          loadConsumerGroups(false),
          refreshKeyInfo(),
        ]

        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('failed to fetch data', async () => {
        const data: UpdateConsumerGroupDto = {
          keyName: 'key',
          name: 'name',
          lastDeliveredId: '0-1',
        }
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.patch = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(modifyLastDeliveredIdAction(data))

        // Assert
        const expectedActions = [
          modifyLastDeliveredId(),
          addErrorNotification(responsePayload as AxiosError),
          modifyLastDeliveredIdFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deleteConsumerGroupsAction', () => {
      it('succeed to delete data', async () => {
        // Arrange
        const keyName = 'key'
        const groups = ['group']
        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        const responsePayloadPost = { data: mockConsumers, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayloadPost)

        // Act
        await store.dispatch<any>(deleteConsumerGroupsAction(keyName, groups))

        // Assert
        const expectedActions = [
          deleteConsumerGroups(),
          deleteConsumerGroupsSuccess(),
          loadConsumerGroups(false),
          refreshKeyInfo(),
          addMessageNotification(
            successMessages.REMOVED_KEY_VALUE(
              keyName,
              groups.join(''),
              'Group',
            ),
          ),
        ]

        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('failed to delete data', async () => {
        const errorMessage = 'Something was wrong!'
        const keyName = 'key'
        const groups = ['group']
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(deleteConsumerGroupsAction(keyName, groups))

        // Assert
        const expectedActions = [
          deleteConsumerGroups(),
          addErrorNotification(responsePayload as AxiosError),
          deleteConsumerGroupsFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('deleteConsumersAction', () => {
      it('succeed to delete data', async () => {
        // Arrange
        const keyName = stringToBuffer('key')
        const groupName = stringToBuffer('group')
        const consumerNames = ['consumer'].map((name) => stringToBuffer(name))
        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        const responsePayloadPost = { data: mockConsumers, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayloadPost)

        // Act
        await store.dispatch<any>(
          deleteConsumersAction(keyName, groupName, consumerNames),
        )

        // Assert
        const expectedActions = [
          deleteConsumers(),
          deleteConsumersSuccess(),
          loadConsumerGroups(false),
          refreshKeyInfo(),
          addMessageNotification(
            successMessages.REMOVED_KEY_VALUE(
              keyName,
              consumerNames.map((name) => bufferToString(name)).join(''),
              'Consumer',
            ),
          ),
        ]

        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('failed to delete data', async () => {
        const errorMessage = 'Something was wrong!'
        const keyName = 'key'
        const groupName = 'group'
        const consumerNames = ['consumer']
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          deleteConsumersAction(keyName, groupName, consumerNames),
        )

        // Assert
        const expectedActions = [
          deleteConsumers(),
          addErrorNotification(responsePayload as AxiosError),
          deleteConsumersFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('fetchMoreConsumerMessages', () => {
      it('succeed to fetch more data', async () => {
        // Arrange
        const pendingMessages = [
          {
            idle: 123,
            id: '123',
            consumerName: 'name',
            delivered: 1,
          },
        ]
        const responsePayload = { status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        const responsePayloadPost = { data: pendingMessages, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayloadPost)

        // Act
        await store.dispatch<any>(fetchMoreConsumerMessages(500))

        // Assert
        const expectedActions = [
          loadConsumerGroups(),
          loadMoreConsumerMessagesSuccess(pendingMessages),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })

      it('failed to fetch more data', async () => {
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchMoreConsumerMessages(500))

        // Assert
        const expectedActions = [
          loadConsumerGroups(),
          addErrorNotification(responsePayload as AxiosError),
          loadConsumerMessagesFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('ackPendingEntriesAction', () => {
      it('succeed to acknowledge data', async () => {
        // Arrange
        const keyName = 'key'
        const groupName = 'group'
        const entries = ['0-1']
        const responsePayload = { status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)
        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          ackPendingEntriesAction(keyName, groupName, entries),
        )

        // Assert
        const expectedActions = [
          ackPendingEntries(),
          ackPendingEntriesSuccess(),
          deleteMessageFromList('0-1'),
          loadConsumerGroups(),
          loadConsumerGroups(),
          addMessageNotification(
            successMessages.MESSAGE_ACTION(entries.join(''), 'acknowledged'),
          ),
        ]

        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('failed to acknowledge message', async () => {
        const errorMessage = 'Something was wrong!'
        const keyName = 'key'
        const groupName = 'group'
        const entries = ['0-1']
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          ackPendingEntriesAction(keyName, groupName, entries),
        )

        // Assert
        const expectedActions = [
          ackPendingEntries(),
          addErrorNotification(responsePayload as AxiosError),
          ackPendingEntriesFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('claimPendingMessagesAction', () => {
      it('succeed to claim message', async () => {
        // Arrange
        const data: Partial<ClaimPendingEntryDto> = {
          keyName: 'key',
          groupName: 'group',
          consumerName: 'name',
          minIdleTime: 0,
          entries: ['0-1'],
        }

        const responsePayload = { status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        const responsePayloadPost = { data: { affected: ['0-1'] }, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayloadPost)

        // Act
        await store.dispatch<any>(claimPendingMessages(data))

        // Assert
        const expectedActions = [
          claimConsumerMessages(),
          claimConsumerMessagesSuccess(),
          loadConsumerGroups(),
          loadConsumerGroups(),
          deleteMessageFromList('0-1'),
          addMessageNotification(
            successMessages.MESSAGE_ACTION('0-1', 'claimed'),
          ),
        ]

        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('succeed to claim message with 0 affected', async () => {
        // Arrange
        const data: Partial<ClaimPendingEntryDto> = {
          keyName: 'key',
          groupName: 'group',
          consumerName: 'name',
          minIdleTime: 0,
          entries: ['0-1'],
        }

        const responsePayload = { status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        const responsePayloadPost = { data: { affected: [] }, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayloadPost)

        // Act
        await store.dispatch<any>(claimPendingMessages(data))

        // Assert
        const expectedActions = [
          claimConsumerMessages(),
          claimConsumerMessagesSuccess(),
          loadConsumerGroups(),
          loadConsumerGroups(),
          addMessageNotification(successMessages.NO_CLAIMED_MESSAGES()),
        ]

        expect(store.getActions().slice(0, expectedActions.length)).toEqual(
          expectedActions,
        )
      })

      it('failed to fetch data', async () => {
        const data: Partial<ClaimPendingEntryDto> = {
          keyName: 'key',
          groupName: 'group',
          consumerName: 'name',
          minIdleTime: 0,
          entries: ['0-1'],
        }
        const errorMessage = 'Something was wrong!'
        const responsePayload = {
          response: {
            status: 500,
            data: { message: errorMessage },
          },
        }

        apiService.post = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(claimPendingMessages(data))

        // Assert
        const expectedActions = [
          claimConsumerMessages(),
          addErrorNotification(responsePayload as AxiosError),
          claimConsumerMessagesFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
