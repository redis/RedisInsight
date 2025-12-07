import { cloneDeep } from 'lodash'
import MockedSocket from 'socket.io-mock'
import {
  cleanup,
  mockedStore,
  initialStateDefault,
} from 'uiSrc/utils/test-utils'
import { MOCK_TIMESTAMP } from 'uiSrc/mocks/data/dateNow'
import reducer, {
  initialState,
  resetMonitorItems,
  monitorSelector,
  toggleMonitor,
  showMonitor,
  toggleHideMonitor,
  stopMonitor,
  setError,
  togglePauseMonitor,
  startMonitor,
  setStartTimestamp,
  setSocket,
  concatMonitorItems,
  MONITOR_ITEMS_MAX_COUNT,
} from '../../cli/monitor'

let store: typeof mockedStore
let socket: typeof MockedSocket
let dateNow: jest.SpyInstance<number>

beforeEach(() => {
  cleanup()
  socket = new MockedSocket()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('monitor slice', () => {
  beforeAll(() => {
    dateNow = jest.spyOn(Date, 'now').mockImplementation(() => MOCK_TIMESTAMP)
  })

  afterAll(() => {
    dateNow.mockRestore()
  })

  describe('toggleMonitor', () => {
    it('default state.isShowMonitor should be falsy', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isShowMonitor: false,
        isMinimizedMonitor: false,
      }

      expect(monitorSelector(initialStateDefault)).toEqual(state)
    })

    it('should properly set isShowMonitor = true', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isShowMonitor: true,
        isMinimizedMonitor: true,
      }

      // Act
      const nextState = reducer(initialState, toggleMonitor())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('showMonitor', () => {
    it('should properly set !isShowMonitor', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isShowMonitor: true,
      }

      // Act
      const nextState = reducer(initialState, showMonitor())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('toggleHideMonitor', () => {
    it('should properly set !isShowMonitor', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isMinimizedMonitor: true,
      }

      // Act
      const nextState = reducer(initialState, toggleHideMonitor())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('startMonitor', () => {
    it('should properly set new state', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isRunning: true,
        isSaveToFile: true,
      }

      // Act
      const nextState = reducer(initialState, startMonitor(true))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('setStartTimestamp', () => {
    it('should properly set new state', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        timestamp: {
          ...initialState.timestamp,
          start: MOCK_TIMESTAMP,
          unPaused: MOCK_TIMESTAMP,
        },
      }

      // Act
      const nextState = reducer(initialState, setStartTimestamp(MOCK_TIMESTAMP))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('togglePauseMonitor', () => {
    it('should properly set new state', () => {
      // Arrange
      const diffTimestamp = 5
      const intermediateState = reducer(
        initialState,
        setStartTimestamp(MOCK_TIMESTAMP - diffTimestamp),
      )
      const state: typeof intermediateState = {
        ...intermediateState,
        isPaused: true,
        timestamp: {
          ...intermediateState.timestamp,
          paused: MOCK_TIMESTAMP,
          duration: diffTimestamp,
        },
      }

      // Act
      const nextState = reducer(intermediateState, togglePauseMonitor())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('stopMonitor', () => {
    it('should properly set new state', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isRunning: false,
      }

      // Act
      const nextState = reducer(initialState, stopMonitor())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('setSocket', () => {
    it('should properly set setSocket = mockedSocket', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        socket,
        isStarted: true,
      }

      // Act
      const nextState = reducer(initialState, setSocket(socket))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('concatMonitorItems', () => {
    it('should properly set payload to items', () => {
      const payload = [
        {
          time: '1',
          args: ['monitor'],
          source: 'source',
          database: 0,
          shardOptions: { host: '127.0.0.1', port: 6379 },
        },
        {
          time: '2',
          args: ['get'],
          source: 'source',
          database: 0,
          shardOptions: { host: '127.0.0.1', port: 6379 },
        },
      ]

      // Arrange
      const state: typeof initialState = {
        ...initialState,
        items: payload,
      }

      // Act
      const nextState = reducer(initialState, concatMonitorItems(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })

    it('should properly set items no more than MONITOR_ITEMS_MAX_COUNT', () => {
      const payload = new Array(MONITOR_ITEMS_MAX_COUNT + 10)

      // Arrange
      const state: typeof initialState = {
        ...initialState,
        items: new Array(MONITOR_ITEMS_MAX_COUNT),
      }

      // Act
      const nextState = reducer(initialState, concatMonitorItems(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('resetMonitorItems', () => {
    it('should properly set isShowMonitor = false', () => {
      // Arrange
      const state: typeof initialState = {
        ...initialState,
        isShowMonitor: false,
      }

      // Act
      const nextState = reducer(initialState, resetMonitorItems())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })

  describe('setError', () => {
    it('should properly set an Error', () => {
      // Arrange
      const error = 'Some error'
      const state: typeof initialState = {
        ...initialState,
        error,
      }

      // Act
      const nextState = reducer(initialState, setError(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        cli: {
          monitor: nextState,
        },
      })
      expect(monitorSelector(rootState)).toEqual(state)
    })
  })
})
