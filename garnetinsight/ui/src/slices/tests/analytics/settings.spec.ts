import { initialStateDefault } from 'uiSrc/utils/test-utils'
import { AnalyticsViewTab } from 'uiSrc/slices/interfaces/analytics'

import reducer, {
  analyticsSettingsSelector,
  initialState,
  setAnalyticsViewTab,
} from '../../analytics/settings'

describe('analytics settings slice', () => {
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

  describe('setAnalyticsViewTab', () => {
    it('should properly set the AnalyticsViewTab.SlowLog', () => {
      // Arrange
      const state = {
        ...initialState,
        viewTab: AnalyticsViewTab.SlowLog,
      }

      // Act
      const nextState = reducer(
        initialState,
        setAnalyticsViewTab(AnalyticsViewTab.SlowLog),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        analytics: { settings: nextState },
      })
      expect(analyticsSettingsSelector(rootState)).toEqual(state)
    })
  })
})
