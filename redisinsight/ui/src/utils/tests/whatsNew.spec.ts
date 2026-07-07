import { FeatureFlags } from 'uiSrc/constants'
import {
  getVisibleWhatsNewVersions,
  isWhatsNewEligible,
  whatsNewFeed,
} from 'uiSrc/utils'

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

describe('getVisibleWhatsNewVersions', () => {
  it('should drop flag-gated cards and omit versions left with none', () => {
    const visible = getVisibleWhatsNewVersions({})

    expect(visible.map((v) => v.version)).not.toContain('3.2.0')
    visible.forEach((v) => {
      expect(v.cards.length).toBeGreaterThan(0)
      v.cards.forEach((card) => expect(card.featureFlag).toBeUndefined())
    })
  })

  it('should include gated cards when their flags are on', () => {
    const visible = getVisibleWhatsNewVersions({
      [FeatureFlags.azureEntraId]: { flag: true },
    })

    expect(visible.map((v) => v.version)).toContain('3.2.0')
  })
})
