import { cloneDeep } from 'lodash'

import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'

import { RunQueryMode } from 'uiSrc/slices/interfaces'
import reducer, {
  initialState,
  searchAndQuerySelector,
  changeSQActiveRunQueryMode,
} from '../../search/searchAndQuery'

jest.mock('uiSrc/services', () => ({
  ...jest.requireActual('uiSrc/services'),
}))

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('slices', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {} as any)

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('changeSQActiveRunQueryMode', () => {
    it('should properly set mode', () => {
      const state = {
        ...initialState,
        activeRunQueryMode: RunQueryMode.Raw,
      }

      const nextState = reducer(
        initialState,
        changeSQActiveRunQueryMode(RunQueryMode.Raw),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        search: { query: nextState },
      })

      expect(searchAndQuerySelector(rootState)).toEqual(state)
    })
  })
})
