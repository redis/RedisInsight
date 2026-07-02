import { cloneDeep } from 'lodash'

import { cleanup, mockedStore } from 'uiSrc/utils/test-utils'
import reducer, {
  initialState,
  openWhatsNew,
  setSelectedVersion,
  closeWhatsNew,
  whatsNewFeed,
  isWhatsNewEligible,
} from 'uiSrc/slices/app/whatsNew'

jest.mock('uiSrc/services')

const latestVersion = whatsNewFeed[0].version

let store: typeof mockedStore
beforeEach(() => {
  cleanup()
  store = cloneDeep(mockedStore)
  store.clearActions()
})

describe('whatsNew slice', () => {
  describe('reducer, actions and selectors', () => {
    it('should return the initial state on first run', () => {
      expect(reducer(undefined, { type: '' })).toEqual(initialState)
    })
  })

  describe('openWhatsNew', () => {
    it('should open at the latest version and mark it as seen', () => {
      const result = reducer(initialState, openWhatsNew())

      expect(result.isOpen).toEqual(true)
      expect(result.selectedVersion).toEqual(latestVersion)
      expect(result.lastVersionSeen).toEqual(latestVersion)
    })

    it('should open at a specific version but still mark the latest as seen', () => {
      const result = reducer(initialState, openWhatsNew('1.0.0'))

      expect(result.isOpen).toEqual(true)
      expect(result.selectedVersion).toEqual('1.0.0')
      expect(result.lastVersionSeen).toEqual(latestVersion)
    })
  })

  describe('setSelectedVersion', () => {
    it('should set the selected version without closing', () => {
      const state = { ...initialState, isOpen: true }
      const result = reducer(state, setSelectedVersion('1.0.0'))

      expect(result.selectedVersion).toEqual('1.0.0')
      expect(result.isOpen).toEqual(true)
    })
  })

  describe('closeWhatsNew', () => {
    it('should close the modal', () => {
      const state = { ...initialState, isOpen: true }
      const result = reducer(state, closeWhatsNew())

      expect(result.isOpen).toEqual(false)
    })
  })

  describe('isWhatsNewEligible', () => {
    it('should be eligible for a new version with cards that is not a patch', () => {
      expect(isWhatsNewEligible(latestVersion, null)).toEqual(true)
    })

    it('should not be eligible when the version was already seen', () => {
      expect(isWhatsNewEligible(latestVersion, latestVersion)).toEqual(false)
    })

    it('should not be eligible for an unknown version', () => {
      expect(isWhatsNewEligible('99.0.0', null)).toEqual(false)
    })
  })
})
