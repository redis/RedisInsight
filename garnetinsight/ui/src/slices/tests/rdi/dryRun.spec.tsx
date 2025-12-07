import { cloneDeep } from 'lodash'
import { AxiosError } from 'axios'
import { AnyAction } from '@reduxjs/toolkit'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  dryRunJob,
  dryRunJobSuccess,
  dryRunJobFailure,
  rdiDryRunJob,
  rdiDryRunJobSelector,
} from 'uiSrc/slices/rdi/dryRun'
import { apiService } from 'uiSrc/services'
import { addErrorNotification } from 'uiSrc/slices/app/notifications'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('rdi dry run slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {} as AnyAction)

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('rdiDryRunJobSelector', () => {
    it('should properly set state', () => {
      // Arrange
      const state = {
        ...initialState,
        loading: true,
        results: null,
      }

      // Act
      const nextState = reducer(initialState, dryRunJob())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          dryRun: nextState,
        },
      })
      expect(rdiDryRunJobSelector(rootState)).toEqual(state)
    })
  })

  describe('dryRunJobSuccess', () => {
    it('should properly set state', () => {
      // Arrange
      const mockData = {
        output: [{ connection: 'name', commands: ['HSET 1 1'] }],
        transformation: { name: 'John' },
      }

      const state = {
        ...initialState,
        results: mockData,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, dryRunJobSuccess(mockData))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          dryRun: nextState,
        },
      })
      expect(rdiDryRunJobSelector(rootState)).toEqual(state)
    })
  })

  describe('dryRunJobFailure', () => {
    it('should properly set state', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        error,
      }

      // Act
      const nextState = reducer(initialState, dryRunJobFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        rdi: {
          dryRun: nextState,
        },
      })
      expect(rdiDryRunJobSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('thunks', () => {
    describe('rdiDryRunJob', () => {
      it('succeed to fetch data', async () => {
        const mockData = {
          output: [
            {
              connection: 'target',
              commands: ['HSET 1 1'],
            },
          ],
          transformation: { name: 'John' },
        }
        const responsePayload = { data: mockData, status: 200 }

        apiService.post = jest.fn().mockResolvedValue(responsePayload)

        // Act
        await store.dispatch<any>(rdiDryRunJob('123', { name: 'Johny' }, {}))

        // Assert
        const expectedActions = [dryRunJob(), dryRunJobSuccess(mockData)]

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
        await store.dispatch<any>(rdiDryRunJob('123', { name: 'Johny' }, {}))

        // Assert
        const expectedActions = [
          dryRunJob(),
          addErrorNotification(responsePayload as AxiosError),
          dryRunJobFailure(errorMessage),
        ]

        expect(store.getActions()).toEqual(expectedActions)
      })
    })
  })
})
