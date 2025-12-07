import { cloneDeep } from 'lodash'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { resourcesService } from 'uiSrc/services'
import { MOCK_EXPLORE_GUIDES } from 'uiSrc/constants/mocks/mock-explore-guides'
import reducer, {
  initialState,
  getGuideLinks,
  getGuideLinksSuccess,
  getGuideLinksFailure,
  fetchGuideLinksAction,
  guideLinksSelector,
} from '../../content/guide-links'

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
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })
  })

  describe('getGuideLinks', () => {
    it('should properly set loading', () => {
      // Arrange
      const loading = true
      const state = {
        ...initialState,
        loading,
      }

      // Act
      const nextState = reducer(initialState, getGuideLinks())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        content: { guideLinks: nextState },
      })

      expect(guideLinksSelector(rootState)).toEqual(state)
    })
  })

  describe('getGuideLinksSuccess', () => {
    it('should properly set state after success', () => {
      // Arrange
      const data = MOCK_EXPLORE_GUIDES
      const state = {
        ...initialState,
        data,
        loading: false,
      }

      // Act
      const nextState = reducer(initialState, getGuideLinksSuccess(data))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        content: { guideLinks: nextState },
      })

      expect(guideLinksSelector(rootState)).toEqual(state)
    })
  })

  describe('getGuideLinksFailure', () => {
    it('should properly set error', () => {
      // Arrange
      const error = 'error'
      const state = {
        ...initialState,
        loading: false,
        error,
      }

      // Act
      const nextState = reducer(initialState, getGuideLinksFailure(error))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        content: { guideLinks: nextState },
      })

      expect(guideLinksSelector(rootState)).toEqual(state)
    })
  })

  // thunks

  describe('fetchGuideLinksAction', () => {
    it('succeed to fetch content', async () => {
      // Arrange
      const data = MOCK_EXPLORE_GUIDES
      const responsePayload = { status: 200, data }

      resourcesService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchGuideLinksAction())

      // Assert
      const expectedActions = [getGuideLinks(), getGuideLinksSuccess(data)]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })

    it('failed to fetch content', async () => {
      // Arrange
      const errorMessage = 'Something was wrong!'
      const responsePayload = {
        response: {
          status: 500,
          data: { message: errorMessage },
        },
      }
      resourcesService.get = jest.fn().mockRejectedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchGuideLinksAction())

      // Assert
      const expectedActions = [
        getGuideLinks(),
        getGuideLinksFailure(errorMessage),
      ]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
  })
})
