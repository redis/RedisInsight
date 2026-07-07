import { isWhatsNewEligible, whatsNewFeed } from 'uiSrc/utils'

const latestVersion = whatsNewFeed[0].version

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
