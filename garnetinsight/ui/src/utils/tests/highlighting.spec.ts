import {
  getHighlightingFeatures,
  getPagesForFeatures,
} from 'uiSrc/utils/features'
import { MOCKED_HIGHLIGHTING_FEATURES } from 'uiSrc/utils/test-utils'

describe('getPagesForFeatures', () => {
  it('should return proper pages for features', () => {
    expect(getPagesForFeatures()).toEqual({})
    expect(getPagesForFeatures([])).toEqual({})
    expect(getPagesForFeatures(['a'])).toEqual({})
    expect(getPagesForFeatures(['importDatabases'])).toEqual({
      browser: ['importDatabases'],
    })
    expect(getPagesForFeatures(MOCKED_HIGHLIGHTING_FEATURES)).toEqual({
      browser: MOCKED_HIGHLIGHTING_FEATURES,
    })
  })
})

describe('getPagesForFeatures', () => {
  it('should return proper pages for features', () => {
    expect(getHighlightingFeatures([])).toEqual({})
    expect(getHighlightingFeatures(['feature1'])).toEqual({ feature1: true })
    expect(getHighlightingFeatures(['f1', 'f2'])).toEqual({
      f1: true,
      f2: true,
    })
  })
})
