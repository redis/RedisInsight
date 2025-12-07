import { cloneDeep } from 'lodash'
import reducer, {
  changeSelectedTab,
  explorePanelSelector,
  initialState,
  insightsPanelSelector,
  resetExplorePanelSearch,
  setExplorePanelContent,
  setExplorePanelIsPageOpen,
  setExplorePanelManifest,
  setExplorePanelScrollTop,
  setExplorePanelSearch,
  changeSidePanel,
  sidePanelsSelector,
  toggleSidePanel,
} from 'uiSrc/slices/panels/sidePanels'
import {
  cleanup,
  initialStateDefault,
  mockedStore,
} from 'uiSrc/utils/test-utils'
import { InsightsPanelTabs, SidePanels } from 'uiSrc/slices/interfaces/insights'

let store: typeof mockedStore

beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('sidePanels slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      // Arrange
      const nextState = initialState

      // Act
      const result = reducer(undefined, {})

      // Assert
      expect(result).toEqual(nextState)
    })

    describe('changeSidePanel', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          openedPanel: SidePanels.Insights,
        }

        // Act
        const nextState = reducer(
          initialState,
          changeSidePanel(SidePanels.Insights),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { sidePanels: nextState },
        })

        expect(sidePanelsSelector(rootState)).toEqual(state)
      })
    })

    describe('toggleSidePanel', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          openedPanel: SidePanels.Insights,
        }

        // Act
        const nextState = reducer(
          initialState,
          toggleSidePanel(SidePanels.Insights),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { sidePanels: nextState },
        })

        expect(sidePanelsSelector(rootState)).toEqual(state)
      })

      it('should properly change state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          openedPanel: SidePanels.Insights,
        }

        const state = {
          ...initialState,
          openedPanel: null,
        }

        // Act
        const nextState = reducer(
          currentState,
          toggleSidePanel(SidePanels.Insights),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { sidePanels: nextState },
        })

        expect(sidePanelsSelector(rootState)).toEqual(state)
      })
    })

    describe('changeSelectedTab', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.insights,
          tabSelected: InsightsPanelTabs.Recommendations,
        }

        // Act
        const nextState = reducer(
          initialState,
          changeSelectedTab(InsightsPanelTabs.Recommendations),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { sidePanels: nextState },
        })
        expect(insightsPanelSelector(rootState)).toEqual(state)
      })
    })

    describe('setExplorePanelSearch', () => {
      it('should properly set state', () => {
        // Arrange
        const search = 'path/0/1'
        const currentState = {
          ...initialState,
          explore: {
            ...initialState.explore,
            itemScrollTop: 100,
          },
        }
        const state = {
          ...initialState,
          explore: {
            ...initialState.explore,
            search,
          },
        }

        // Act
        const nextState = reducer(currentState, setExplorePanelSearch(search))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { sidePanels: nextState },
        })
        expect(sidePanelsSelector(rootState)).toEqual(state)
      })
    })

    describe('setExplorePanelScrollTop', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState,
          explore: {
            ...initialState.explore,
            itemScrollTop: 100,
          },
        }

        // Act
        const nextState = reducer(initialState, setExplorePanelScrollTop(100))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { sidePanels: nextState },
        })
        expect(sidePanelsSelector(rootState)).toEqual(state)
      })
    })

    describe('resetExplorePanelSearch', () => {
      it('should properly set state', () => {
        // Arrange
        const currentState = {
          ...initialState,
          explore: {
            ...initialState.explore,
            search: 'path/1/1',
            itemScrollTop: 100,
          },
        }

        const state = {
          ...initialState,
          explore: {
            ...initialState.explore,
          },
        }

        // Act
        const nextState = reducer(currentState, resetExplorePanelSearch())

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { sidePanels: nextState },
        })
        expect(sidePanelsSelector(rootState)).toEqual(state)
      })
    })

    describe('setExplorePanelContent', () => {
      it('should properly set state', () => {
        // Arrange
        const data = {
          data: 'any content',
          url: 'url:123',
        }
        const state = {
          ...initialState.explore,
          ...data,
        }

        // Act
        const nextState = reducer(initialState, setExplorePanelContent(data))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { sidePanels: nextState },
        })
        expect(explorePanelSelector(rootState)).toEqual(state)
      })
    })

    describe('setExplorePanelIsPageOpen', () => {
      it('should properly set state', () => {
        // Arrange
        const state = {
          ...initialState.explore,
          isPageOpen: true,
        }

        // Act
        const nextState = reducer(initialState, setExplorePanelIsPageOpen(true))

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { sidePanels: nextState },
        })
        expect(explorePanelSelector(rootState)).toEqual(state)
      })
    })

    describe('setExplorePanelManifest', () => {
      it('should properly set state', () => {
        // Arrange
        const manifest = {
          page1: '1',
        }
        const state = {
          ...initialState.explore,
          manifest,
        }

        // Act
        const nextState = reducer(
          initialState,
          setExplorePanelManifest(manifest),
        )

        // Assert
        const rootState = Object.assign(initialStateDefault, {
          panels: { sidePanels: nextState },
        })
        expect(explorePanelSelector(rootState)).toEqual(state)
      })
    })
  })
})
