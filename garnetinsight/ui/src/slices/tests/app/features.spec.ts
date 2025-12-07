import { cloneDeep } from 'lodash'
import reducer, {
  initialState,
  setFeaturesInitialState,
  appFeatureSelector,
  setFeaturesToHighlight,
  removeFeatureFromHighlighting,
  setOnboarding,
  skipOnboarding,
  setOnboardPrevStep,
  setOnboardNextStep,
  incrementOnboardStepAction,
  getFeatureFlags,
  getFeatureFlagsSuccess,
  getFeatureFlagsFailure,
  fetchFeatureFlags,
} from 'uiSrc/slices/app/features'
import {
  cleanup,
  initialStateDefault,
  MOCKED_HIGHLIGHTING_FEATURES,
  mockedStore,
  mockStore,
} from 'uiSrc/utils/test-utils'
import { apiService } from 'uiSrc/services'

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

const mockFeatures = MOCKED_HIGHLIGHTING_FEATURES
describe('slices', () => {
  describe('setFeaturesInitialState', () => {
    it('should properly set initial state', () => {
      const nextState = reducer(initialState, setFeaturesInitialState())
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })
      expect(appFeatureSelector(rootState)).toEqual(initialState)
    })
  })

  describe('setFeaturesToHighlight', () => {
    it('should properly set features to highlight', () => {
      const payload = {
        features: mockFeatures,
        version: '2.0.0',
      }
      const state = {
        ...initialState,
        highlighting: {
          ...initialState.highlighting,
          features: payload.features,
          version: payload.version,
          pages: {
            browser: payload.features,
          },
        },
      }

      // Act
      const nextState = reducer(initialState, setFeaturesToHighlight(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })
  })

  describe('removeFeatureFromHighlighting', () => {
    it('should properly remove feature to highlight', () => {
      const prevState = {
        ...initialState,
        highlighting: {
          ...initialState.highlighting,
          features: mockFeatures,
          version: '2.0.0',
          pages: {
            browser: mockFeatures,
          },
        },
      }

      const payload = mockFeatures[0]
      const state = {
        ...prevState,
        highlighting: {
          ...prevState.highlighting,
          features: [mockFeatures[1]],
          pages: {
            browser: [mockFeatures[1]],
          },
        },
      }

      // Act
      const nextState = reducer(
        prevState,
        removeFeatureFromHighlighting(payload),
      )

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })
  })

  describe('setOnboarding', () => {
    it('should properly set onboarding', () => {
      const payload = {
        currentStep: 0,
        totalSteps: 14,
      }
      const state = {
        ...initialState,
        onboarding: {
          ...initialState.onboarding,
          currentStep: 0,
          totalSteps: 14,
          isActive: true,
        },
      }

      // Act
      const nextState = reducer(initialState, setOnboarding(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })

    it('should not set onboarding when currenStep > totalSteps', () => {
      const payload = {
        currentStep: 5,
        totalSteps: 4,
      }
      const state = {
        ...initialState,
      }

      // Act
      const nextState = reducer(initialState, setOnboarding(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })
  })

  describe('skipOnboarding', () => {
    it('should properly set state', () => {
      const currenState = {
        ...initialState,
        onboarding: {
          ...initialState.onboarding,
          isActive: true,
        },
      }

      const state = {
        ...initialState,
        onboarding: {
          ...initialState.onboarding,
          isActive: false,
        },
      }

      // Act
      const nextState = reducer(currenState, skipOnboarding())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })
  })

  describe('setOnboardPrevStep', () => {
    it('should properly set state', () => {
      const currenState = {
        ...initialState,
        onboarding: {
          ...initialState.onboarding,
          isActive: true,
          currentStep: 3,
          totalSteps: 10,
        },
      }

      const state = {
        ...currenState,
        onboarding: {
          ...currenState.onboarding,
          currentStep: 2,
        },
      }

      // Act
      const nextState = reducer(currenState, setOnboardPrevStep())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })

    it('should properly set state with isActive = false', () => {
      const currenState = {
        ...initialState,
        onboarding: {
          ...initialState.onboarding,
          isActive: false,
          currentStep: 3,
          totalSteps: 10,
        },
      }

      const state = {
        ...currenState,
        onboarding: {
          ...currenState.onboarding,
        },
      }

      // Act
      const nextState = reducer(currenState, setOnboardPrevStep())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })

    it('should properly set state with currentStep === 0', () => {
      const currenState = {
        ...initialState,
        onboarding: {
          ...initialState.onboarding,
          isActive: true,
          currentStep: 0,
          totalSteps: 10,
        },
      }

      const state = {
        ...currenState,
        onboarding: {
          ...currenState.onboarding,
        },
      }

      // Act
      const nextState = reducer(currenState, setOnboardPrevStep())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })
  })

  describe('setOnboardNextStep', () => {
    it('should properly set state', () => {
      const currenState = {
        ...initialState,
        onboarding: {
          ...initialState.onboarding,
          isActive: true,
          currentStep: 3,
          totalSteps: 10,
        },
      }

      const state = {
        ...currenState,
        onboarding: {
          ...currenState.onboarding,
          currentStep: 4,
        },
      }

      // Act
      const nextState = reducer(currenState, setOnboardNextStep())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })

    it('should properly set state with isActive = false', () => {
      const currenState = {
        ...initialState,
        onboarding: {
          ...initialState.onboarding,
          isActive: false,
          currentStep: 3,
          totalSteps: 10,
        },
      }

      const state = {
        ...currenState,
        onboarding: {
          ...currenState.onboarding,
        },
      }

      // Act
      const nextState = reducer(currenState, setOnboardNextStep())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })

    it('should properly set state with currentStep === totalSteps', () => {
      const currenState = {
        ...initialState,
        onboarding: {
          ...initialState.onboarding,
          isActive: true,
          currentStep: 10,
          totalSteps: 10,
        },
      }

      const state = {
        ...currenState,
        onboarding: {
          ...currenState.onboarding,
          currentStep: 11,
          isActive: false,
        },
      }

      // Act
      const nextState = reducer(currenState, setOnboardNextStep())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })
  })

  describe('getFeatureFlags', () => {
    it('should properly set state', () => {
      const state = {
        ...initialState,
        featureFlags: {
          ...initialState.featureFlags,
          loading: true,
        },
      }

      // Act
      const nextState = reducer(initialState, getFeatureFlags())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })
  })

  describe('getFeatureFlagsSuccess', () => {
    it('should properly set state', () => {
      const payload = {
        features: {
          insightsRecommendations: {
            flag: true,
          },
        },
      }
      const state = {
        ...initialState,
        featureFlags: {
          ...initialState.featureFlags,
          features: payload.features,
        },
      }

      // Act
      const nextState = reducer(initialState, getFeatureFlagsSuccess(payload))

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })
  })

  describe('getFeatureFlagsFailure', () => {
    it('should properly set state', () => {
      const currentState = {
        ...initialState,
        featureFlags: {
          ...initialState.featureFlags,
          loading: true,
        },
      }

      const state = {
        ...initialState,
        featureFlags: {
          ...initialState.featureFlags,
          loading: false,
        },
      }

      // Act
      const nextState = reducer(currentState, getFeatureFlagsFailure())

      // Assert
      const rootState = Object.assign(initialStateDefault, {
        app: { features: nextState },
      })

      expect(appFeatureSelector(rootState)).toEqual(state)
    })
  })

  // thunks
  describe('incrementOnboardStepAction', () => {
    it('should call setOnboardNextStep', async () => {
      // Act
      const nextState = Object.assign(initialStateDefault, {
        app: {
          features: {
            ...initialState,
            onboarding: {
              isActive: true,
              currentStep: 3,
              totalSteps: 10,
            },
          },
        },
      })
      const mockedStore = mockStore(nextState)
      await mockedStore.dispatch<any>(incrementOnboardStepAction(3))
      // Assert
      const expectedActions = [setOnboardNextStep(0)]

      expect(mockedStore.getActions()).toEqual(expectedActions)
    })
    it('should not call setOnboardNextStep with isActive == false', async () => {
      // Act
      const nextState = Object.assign(initialStateDefault, {
        app: {
          features: {
            ...initialState,
            onboarding: {
              isActive: false,
              currentStep: 3,
              totalSteps: 10,
            },
          },
        },
      })
      const mockedStore = mockStore(nextState)
      await mockedStore.dispatch<any>(incrementOnboardStepAction(3))

      expect(mockedStore.getActions()).toEqual([])
    })

    it('should not call setOnboardNextStep with different step', async () => {
      // Act
      const nextState = Object.assign(initialStateDefault, {
        app: {
          features: {
            ...initialState,
            onboarding: {
              isActive: true,
              currentStep: 4,
              totalSteps: 10,
            },
          },
        },
      })
      const mockedStore = mockStore(nextState)
      await mockedStore.dispatch<any>(incrementOnboardStepAction(5))

      expect(mockedStore.getActions()).toEqual([])
    })
  })

  describe('fetchFeatureFlags', () => {
    it('succeed to fetch data', async () => {
      // Arrange
      const data = { features: { insightsRecommendations: true } }
      const responsePayload = { data, status: 200 }

      apiService.get = jest.fn().mockResolvedValue(responsePayload)

      // Act
      await store.dispatch<any>(fetchFeatureFlags())

      // Assert
      const expectedActions = [getFeatureFlags(), getFeatureFlagsSuccess(data)]

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
      await store.dispatch<any>(fetchFeatureFlags())

      // Assert
      const expectedActions = [getFeatureFlags(), getFeatureFlagsFailure()]

      expect(store.getActions()).toEqual(expectedActions)
    })
  })
})
