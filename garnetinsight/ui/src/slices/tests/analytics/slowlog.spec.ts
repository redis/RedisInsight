import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { DEFAULT_SLOWLOG_DURATION_UNIT } from 'uiSrc/constants'
import { apiService } from 'uiSrc/services'
import { setSlowLogUnits } from 'uiSrc/slices/app/context'
import {
  cleanup,
  mockedStore,
  initialStateDefault,
} from 'uiSrc/utils/test-utils'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'

import { SlowLog, SlowLogConfig } from 'apiSrc/modules/slow-log/models'

import reducer, {
  initialState,
  getSlowLogConfig,
  getSlowLogConfigSuccess,
  getSlowLogConfigError,
  getSlowLogs,
  getSlowLogsSuccess,
  getSlowLogsError,
  clearSlowLogAction,
  deleteSlowLogs,
  deleteSlowLogsError,
  deleteSlowLogsSuccess,
  fetchSlowLogsAction,
  getSlowLogConfigAction,
  patchSlowLogConfigAction,
  setSlowLogInitialState,
  slowLogSelector,
} from '../../analytics/slowlog'

let store: typeof mockedStore
let dateNow: jest.SpyInstance<number>

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('slowLog slice', () => {
  beforeAll(() => {
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => MOCK_TIMESTAMP)
  })

  afterAll(() => {
    dateNow.mockRestore()
  })

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

  describe('setUserSettingsInitialState', () => {
    it('should properly set the initial state', () => {
      // Arrange
      const state = {
        ...initialState,
      }

      // Act
      const nextState = reducer(initialState, setSlowLogInitialState())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { slowlog: nextState },
      })
      expect(slowLogSelector(rootState)).toEqual(state)
    })
  })

  describe('getSlowLogs', () => {
    it('should properly set state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, getSlowLogs())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { slowlog: nextState },
      })
      expect(slowLogSelector(rootState)).toEqual(state)
    })
  })

  describe('getSlowLogsSuccess', () => {
    it('should properly set state after success fetch data', () => {
      // Arrange
      const data: SlowLog[] = [
        {
          id: 1,
          time: 1652265051,
          durationUs: 199,
          args: 'SET foo bar',
          source: '127.17.0.1:46922',
        },
      ]
      const state = {
        ...initialState,
        loading: false,
        data,
        lastRefreshTime: MOCK_TIMESTAMP,
      }

      // Act
      const nextState = reducer(initialState, getSlowLogsSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { slowlog: nextState },
      })
      expect(slowLogSelector(rootState)).toEqual(state)
    })
  })

  describe('getSlowLogsError', () => {
    it('should properly set state after failed fetch data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, getSlowLogsError(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { slowlog: nextState },
      })
      expect(slowLogSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteSlowLogs', () => {
    it('should properly set state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, getSlowLogs())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { slowlog: nextState },
      })
      expect(slowLogSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteSlowLogsSuccess', () => {
    it('should properly set state after success fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: false,
        data: [],
      }

      // Act
      const nextState = reducer(initialState, deleteSlowLogsSuccess())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { slowlog: nextState },
      })
      expect(slowLogSelector(rootState)).toEqual(state)
    })
  })

  describe('deleteSlowLogsError', () => {
    it('should properly set state after failed fetch data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, deleteSlowLogsError(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { slowlog: nextState },
      })
      expect(slowLogSelector(rootState)).toEqual(state)
    })
  })

  describe('getSlowLogConfig', () => {
    it('should properly set state before the fetch data', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
      }

      // Act
      const nextState = reducer(initialState, getSlowLogConfig())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { slowlog: nextState },
      })
      expect(slowLogSelector(rootState)).toEqual(state)
    })
  })

  describe('getSlowLogConfigSuccess', () => {
    it('should properly set state after success fetch data', () => {
      // Arrange
      const config: SlowLogConfig = {
        slowlogMaxLen: 100,
        slowlogLogSlowerThan: 300,
      }
      const state = {
        ...initialState,
        loading: false,
        config,
      }

      // Act
      const nextState = reducer(initialState, getSlowLogConfigSuccess(config))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { slowlog: nextState },
      })
      expect(slowLogSelector(rootState)).toEqual(state)
    })
  })

  describe('getSlowLogConfigError', () => {
    it('should properly set state after failed fetch data', () => {
      // Arrange
      const error = 'Some error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, getSlowLogConfigError(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { slowlog: nextState },
      })
      expect(slowLogSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('thunks', () => {
    describe('fetchSlowLogsAction', () => {
      it('succeed to fetch data', async () => {
        // Arrange
        const data: SlowLog[] = [
          {
            id: 1,
            time: 1652265051,
            durationUs: 199,
            args: 'SET foo bar',
            source: '127.17.0.1:46922',
          },
        ]
        const responsePayload = { data, status: 200 }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchSlowLogsAction('123', 100))

        // Assert
        const expectedActions = [getSlowLogs(), getSlowLogsSuccess(data)]

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

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(fetchSlowLogsAction('123', 100))

        // Assert
        const expectedActions = [
          getSlowLogs(),
          addErrorNotification(responsePayload as AxiosError),
          getSlowLogsError(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('clearSlowLogAction', () => {
      it('succeed to fetch data', async () => {
        const responsePayload = { status: 200 }

        apiService.delete = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(clearSlowLogAction('123'))

        // Assert
        const expectedActions = [deleteSlowLogs(), deleteSlowLogsSuccess()]

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

        apiService.delete = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(clearSlowLogAction('123'))

        // Assert
        const expectedActions = [
          deleteSlowLogs(),
          addErrorNotification(responsePayload as AxiosError),
          deleteSlowLogsError(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('getSlowLogConfigAction', () => {
      it('succeed to fetch data', async () => {
        const data = {
          slowlogMaxLen: 100,
          slowlogLogSlowerThan: 1200,
        }
        const responsePayload = { status: 200, data }

        apiService.get = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(getSlowLogConfigAction('123'))

        // Assert
        const expectedActions = [
          getSlowLogConfig(),
          getSlowLogConfigSuccess(data),
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

        apiService.get = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(getSlowLogConfigAction('123'))

        // Assert
        const expectedActions = [
          getSlowLogConfig(),
          addErrorNotification(responsePayload as AxiosError),
          getSlowLogConfigError(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })

    describe('patchSlowLogConfigAction', () => {
      it('succeed to fetch data', async () => {
        const data = {
          slowlogMaxLen: 100,
          slowlogLogSlowerThan: 1200,
        }
        const config = {
          ...data,
        }
        const responsePayload = { status: 200, data }

        apiService.patch = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          patchSlowLogConfigAction(
            '123',
            config,
            DEFAULT_SLOWLOG_DURATION_UNIT,
          ),
        )

        // Assert
        const expectedActions = [
          getSlowLogConfig(),
          getSlowLogConfigSuccess(data),
          setSlowLogUnits(DEFAULT_SLOWLOG_DURATION_UNIT),
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

        apiService.patch = jest.fn().mockRejectedValue(responsePayload)

        // Act
        await store.dispatch<any>(
          patchSlowLogConfigAction(
            '123',
            {
              slowlogMaxLen: 100,
              slowlogLogSlowerThan: 1200,
            },
            DEFAULT_SLOWLOG_DURATION_UNIT,
          ),
        )

        // Assert
        const expectedActions = [
          getSlowLogConfig(),
          addErrorNotification(responsePayload as AxiosError),
          getSlowLogConfigError(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
